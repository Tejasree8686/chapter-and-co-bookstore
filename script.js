/* =============================================================================
   Chapter & Co. bookstore - application script (vanilla JS, no modules, runs from file://)

   File map (top to bottom):
     1. Configuration      limits, storage keys, timings, messages, categories
     2. Catalogue          the books array
     3. Helpers            $, $$, esc, money, reduceMotion, toast
     4. State and timers   state, toastTimer, searchTimer, storageWarned, newsletterFailed
     5. Persistence        localStorage load, validate, save and cross-tab sync
     6. Actions            add to bag, wishlist, bag quantity changes, clear search
     7. Rendering          result count, empty state, cards, grid, badges, bag drawer
     8. UI controls        menu and bag drawer open/close, focus trap
     9. Newsletter         email validation and inline message
    10. Event handlers     one named function per listener
    11. Initialisation     init() builds the pills, binds listeners, loads saved state, renders

   Test-facing names (read or replaced by the files in _verify/). Do not rename them, and keep
   the functions as plain function declarations so that calls resolve by name at call time:
     functions: render renderGrid cartRender addToCart setMenu toast saveState
                setNewsletterMessage parseSaved esc money
     variables: state books MAX_QTY_PER_BOOK STORAGE_FAIL_MESSAGE storageWarned
                toastTimer searchTimer newsletterFailed
   ============================================================================= */

/* ---- 1. Configuration ---------------------------------------------------- */
const MAX_QTY_PER_BOOK=10;
const FREE_DELIVERY_MIN=799;
const ALL_BOOKS="All books";
const CATEGORIES=[ALL_BOOKS,"Fiction","Personal Growth","Technology","Business","Children"];
const SEARCH_DELAY_MS=150;
const TOAST_MS=2200;
const STORAGE_TOAST_MS=5000;
const STORAGE_KEY="chapterco:bookstore:v1",STORAGE_VERSION=1,MAX_STORED_CHARS=10000;
const STORAGE_FAIL_MESSAGE="Your bag and wishlist still work, but can't be saved in this browser. They will be lost when you close this page.";
const NEWSLETTER_DEMO_MESSAGE="Thanks! This is a demo. No subscription has been sent or stored.";
const EMAIL_REQUIRED_MESSAGE="Enter your email address.";
const EMAIL_INVALID_MESSAGE="Enter a valid email address, like name@example.com.";
const CHECKOUT_DEMO_MESSAGE="Demo checkout — connect a payment provider for real orders";
// Practical ASCII-only email check (not a full RFC 5322 parser). Internationalized addresses
// (Unicode local parts, IDN domains, punycode TLDs), quoted local parts and IP-literal domains are not supported.
const EMAIL_RE=/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;

/* ---- 2. Catalogue --------------------------------------------------------- */
const books=[
{id:1,title:"The Midnight Library",author:"Matt Haig",category:"Fiction",price:399,old:499,rating:4.8,tag:"Bestseller",color:"midnight",art:"☾"},
{id:2,title:"Atomic Habits",author:"James Clear",category:"Personal Growth",price:449,old:599,rating:4.9,tag:"Reader favourite",color:"atomic",art:"◎"},
{id:3,title:"The Psychology of Money",author:"Morgan Housel",category:"Business",price:349,old:450,rating:4.7,tag:"Popular",color:"money",art:"₹"},
{id:4,title:"Ikigai",author:"Héctor García & Francesc Miralles",category:"Personal Growth",price:299,old:399,rating:4.6,tag:"",color:"ikigai",art:"生"},
{id:5,title:"Clean Code",author:"Robert C. Martin",category:"Technology",price:699,old:899,rating:4.8,tag:"For developers",color:"code",art:"</>"},
{id:6,title:"The Alchemist",author:"Paulo Coelho",category:"Fiction",price:279,old:350,rating:4.7,tag:"",color:"alchemist",art:"☼"},
{id:7,title:"Think Again",author:"Adam Grant",category:"Business",price:425,old:550,rating:4.5,tag:"Staff pick",color:"think",art:"?"},
{id:8,title:"The Very Hungry Caterpillar",author:"Eric Carle",category:"Children",price:250,old:320,rating:4.9,tag:"Little readers",color:"caterpillar",art:"● ● ●"}];

/* ---- 3. Helpers ----------------------------------------------------------- */
const $=s=>document.querySelector(s);
const $$=s=>document.querySelectorAll(s);
const inr=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",minimumFractionDigits:0,maximumFractionDigits:0});
const money=n=>inr.format(n);
// Escapes text for use inside HTML text nodes and double- or single-quoted attribute values.
const ESC_MAP={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
const esc=v=>String(v).replace(/[&<>"']/g,c=>ESC_MAP[c]);
const reduceMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function toast(message,ms=TOAST_MS){
  $("#toast").textContent=message;
  $("#toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$("#toast").classList.remove("show"),ms);
}

/* ---- 4. State and timers -------------------------------------------------- */
const state={category:ALL_BOOKS,search:"",sort:"featured",cart:[],wishlist:[],wishlistOnly:false};
let toastTimer;
let searchTimer;
let storageWarned=false;
let newsletterFailed=false;

/* ---- 5. Persistence (localStorage) ----------------------------------------
   Stored data is untrusted: it is validated before use and holds only IDs and quantities.
   Shape: {"v":1,"cart":[{"id":1,"qty":2}],"wishlist":[3,7]}. Search text, sort, category and book metadata are never stored.
   Limitation: when two tabs change state at the same moment the last writer wins (whole-state replacement, no merge). */
function getStore(){try{return window.localStorage||null}catch(e){return null}}
// Returns {cart:[{id,qty}],wishlist:[id]} built only from known fields, or null if the root is not a supported payload.
function sanitizeSaved(data){
  if(!data||typeof data!=="object"||Array.isArray(data)||data.v!==STORAGE_VERSION)return null;
  const known=new Set(books.map(b=>b.id)),out={cart:[],wishlist:[]},seenCart=new Set(),seenWish=new Set();
  if(Array.isArray(data.cart))for(const e of data.cart){
    if(!e||typeof e!=="object"||Array.isArray(e))continue;
    const id=e.id,qty=e.qty;
    if(!Number.isInteger(id)||!known.has(id)||seenCart.has(id)||!Number.isInteger(qty)||qty<1)continue;
    seenCart.add(id);out.cart.push({id,qty:Math.min(qty,MAX_QTY_PER_BOOK)});
  }
  if(Array.isArray(data.wishlist))for(const id of data.wishlist){
    if(!Number.isInteger(id)||!known.has(id)||seenWish.has(id))continue;
    seenWish.add(id);out.wishlist.push(id);
  }
  return out;
}
// Nothing saved -> empty state. Oversized, malformed or unsupported data -> null.
function parseSaved(raw){
  if(raw===null||raw===undefined)return {cart:[],wishlist:[]};
  if(typeof raw!=="string"||raw.length>MAX_STORED_CHARS)return null;
  try{return sanitizeSaved(JSON.parse(raw))}catch(e){return null}
}
// Returns a sanitized state, or null when storage is unavailable or the saved data is invalid.
function readSaved(){
  let raw;
  try{const s=getStore();if(!s)return null;raw=s.getItem(STORAGE_KEY)}catch(e){return null}
  return parseSaved(raw);
}
function snapshot(){return {cart:state.cart.map(x=>({id:x.id,qty:x.qty})),wishlist:[...state.wishlist]}}
function applySaved(s){
  state.cart=s.cart.map(x=>({...books.find(b=>b.id===x.id),qty:x.qty}));
  state.wishlist=[...s.wishlist];
}
// Call after every user-initiated cart or wishlist change. On failure the state stays in memory and the user is told once.
function saveState(){
  try{
    const s=getStore();
    if(!s)throw new Error("storage unavailable");
    s.setItem(STORAGE_KEY,JSON.stringify({v:STORAGE_VERSION,...snapshot()}));
    storageWarned=false;
  }catch(e){
    if(!storageWarned){storageWarned=true;setTimeout(()=>toast(STORAGE_FAIL_MESSAGE,STORAGE_TOAST_MS),0)}
  }
}
// Adopts state saved by another tab (or restored from the back/forward cache). Invalid or unreadable data is ignored.
function syncFromStorage(){
  const saved=readSaved();
  if(!saved||JSON.stringify(saved)===JSON.stringify(snapshot()))return;
  applySaved(saved);
  updateBadges();renderGrid();
  if(!$("#drawer").hidden){cartRender();announceCart("Your bag was updated in another tab.")}
}
// Load saved state once at start-up. Unreadable, invalid or unsupported data leaves the empty state; it is overwritten on the next change.
function loadSavedState(){
  const saved=readSaved();
  if(saved)applySaved(saved);
}

/* ---- 6. Actions ----------------------------------------------------------- */
function addToCart(id){
  const book=books.find(x=>x.id===id);
  if(!book)return false;
  const line=state.cart.find(x=>x.id===id);
  if(line){if(line.qty>=MAX_QTY_PER_BOOK)return false;line.qty++}
  else state.cart.push({...book,qty:1});
  saveState();
  return true;
}
// Handles the -/+ buttons in the bag. A missing line (stale button) just re-renders.
function changeCartQty(id,delta){
  const item=state.cart.find(x=>x.id===id);
  if(!item){cartRender();updateBadges();return}
  let msg;
  if(delta>0){
    if(!addToCart(id)){announceCart(`${item.title}: maximum of ${MAX_QTY_PER_BOOK} reached`);return}
    msg=`${item.title}: quantity ${item.qty}${item.qty>=MAX_QTY_PER_BOOK?", maximum reached":""}`;
  }else{
    item.qty+=delta;
    if(item.qty<1){state.cart=state.cart.filter(x=>x.id!==id);msg=`${item.title} removed from your bag`}
    else msg=`${item.title}: quantity ${item.qty}`;
    saveState();
  }
  cartRender();updateBadges();announceCart(msg);
}
function removeFromCart(id){
  const item=state.cart.find(x=>x.id===id);
  state.cart=state.cart.filter(x=>x.id!==id);saveState();
  cartRender();updateBadges();
  if(item)announceCart(`${item.title} removed from your bag`);
}
function toggleWishlist(id,btn){
  state.wishlist=state.wishlist.includes(id)?state.wishlist.filter(x=>x!==id):[...state.wishlist,id];saveState();
  updateBadges();
  if(state.wishlistOnly){renderGrid();return}
  const saved=state.wishlist.includes(id);
  btn.classList.toggle("active",saved);btn.setAttribute("aria-pressed",String(saved));btn.textContent=saved?"♥":"♡";
}
function exitWishlist(){state.wishlistOnly=false;render()}
function clearSearch(){state.search="";$("#search").value="";renderGrid()}

/* ---- 7. Rendering --------------------------------------------------------- */
function countText(n){
  const q=state.search.trim(),parts=[];
  if(q)parts.push(`for “${q}”`);
  if(state.category!==ALL_BOOKS)parts.push(`in ${state.category}`);
  if(state.wishlistOnly)parts.push("in your wishlist");
  const noun=n===1?"book":"books";
  return parts.length?`${n} ${noun} found ${parts.join(" ")}`:`${n} thoughtfully selected ${noun}`;
}
function emptyState(){
  const q=state.search.trim();let msg,label,action;
  if(state.wishlistOnly&&!state.wishlist.length){msg="Your wishlist is empty. Tap the ♡ on any book to save it here.";label="Browse all books";action="browse"}
  else if(state.wishlistOnly){msg=q?`None of your saved books match “${q}”.`:"No saved books to show.";label=q?"Clear search":"Show all books";action=q?"clear-search":"browse"}
  else if(q){msg=`No books match “${q}”${state.category!==ALL_BOOKS?` in ${state.category}`:""}. Try a different title, author or category.`;label="Clear search";action="clear-search"}
  else{msg=`No books found in ${state.category}.`;label="Show all books";action="browse"}
  $("#emptyMsg").textContent=msg;$("#emptyAction").textContent=label;$("#emptyAction").dataset.action=action;
}
function cardHTML(b){
  const saved=state.wishlist.includes(b.id);
  const tag=b.tag?`<span class="tag">${esc(b.tag)}</span>`:"";
  const heart=`<button class="heart ${saved?"active":""}" data-wish="${esc(b.id)}" aria-pressed="${saved}" aria-label="Save ${esc(b.title)} to wishlist">${saved?"♥":"♡"}</button>`;
  const cover=`<div class="cover ${esc(b.color)}" aria-hidden="true"><small>CHAPTER &amp; CO. EDITION</small><span style="font-size:48px;text-align:center">${esc(b.art)}</span><strong>${esc(b.title.toUpperCase())}</strong><small>${esc(b.author.toUpperCase())}</small></div>`;
  const info=`<div class="info"><small>${esc(b.category.toUpperCase())}</small><h3>${esc(b.title)}</h3><p class="author">by ${esc(b.author)}</p><div class="rating">★ ${esc(b.rating)} <span> · Reader rating</span></div><div class="bottom"><div><strong>${money(b.price)}</strong><del>${money(b.old)}</del></div><button class="add" data-add="${esc(b.id)}" aria-label="Add ${esc(b.title)} to cart">+</button></div></div>`;
  return `<article class="card"><div class="visual">${tag}${heart}${cover}</div>${info}</article>`;
}
// Selector of the grid button that has focus (so focus can be restored after a re-render), or null.
function gridFocusKey(){
  const ga=document.activeElement;
  if(!ga||!$("#grid").contains(ga))return null;
  return ga.dataset.add?`[data-add="${ga.dataset.add}"]`:ga.dataset.wish?`[data-wish="${ga.dataset.wish}"]`:null;
}
// Books matching the current category, search and wishlist filter, in the current sort order.
function visibleBooks(){
  const q=state.search.trim().toLowerCase();
  const list=books.filter(b=>(state.category===ALL_BOOKS||b.category===state.category)&&(!q||`${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q))&&(!state.wishlistOnly||state.wishlist.includes(b.id)));
  if(state.sort==="low")list.sort((a,b)=>a.price-b.price);
  if(state.sort==="high")list.sort((a,b)=>b.price-a.price);
  if(state.sort==="rating")list.sort((a,b)=>b.rating-a.rating);
  return list;
}
// Rebuilds the book grid, result count and empty state. Depends on search, category, sort and wishlist filter only.
function renderGrid(){
  clearTimeout(searchTimer);
  const gk=gridFocusKey();
  const list=visibleBooks();
  $("#grid").innerHTML=list.map(cardHTML).join("");
  $("#count").textContent=countText(list.length);$("#grid").hidden=!list.length;$("#empty").hidden=!!list.length;
  if(!list.length)emptyState();
  if(gk){const t=$(`#grid ${gk}`)||$("#grid button")||(list.length?null:$("#emptyAction"));if(t)t.focus()}
}
// Updates the header badges, labels and wishlist bar. Does not touch the grid.
function updateBadges(){
  $("#wishBar").hidden=!state.wishlistOnly;
  $("#wishBarText").textContent=`Showing your wishlist (${state.wishlist.length} saved)`;
  const wish=$("#wish");
  wish.setAttribute("aria-pressed",String(state.wishlistOnly));
  wish.setAttribute("aria-label",`Wishlist, ${state.wishlist.length} saved`);
  $("#wishIcon").textContent=state.wishlistOnly?"♥":"♡";
  $$("[data-category]").forEach(x=>x.classList.toggle("active",x.dataset.category===state.category));
  const bagQty=state.cart.reduce((n,x)=>n+x.qty,0);
  $("#cartCount").textContent=bagQty;
  $("#cart").setAttribute("aria-label",`Bag, ${bagQty} ${bagQty===1?"item":"items"}`);
  $("#wishCount").textContent=state.wishlist.length;
}
function render(){renderGrid();updateBadges()}
function cartFocusKey(){
  const a=document.activeElement;
  if(!a||!$("#cartItems").contains(a))return null;
  const row=[...$$("#cartItems .cart-row")].indexOf(a.closest(".cart-row"));
  if(a.dataset.change)return {sel:`[data-change="${a.dataset.change}"][data-delta="${a.dataset.delta}"]`,id:a.dataset.change,delta:a.dataset.delta,row};
  if(a.dataset.remove)return {sel:`[data-remove="${a.dataset.remove}"]`,remove:true,id:a.dataset.remove,row};
  return null;
}
// Focus order: the same control; else the same item's enabled -/+ (e.g. "+" disabled at the limit);
// else the control in the row that took the removed row's place (or the previous row); else the close button.
function restoreCartFocus(k){
  let t=$(`#cartItems ${k.sel}`);
  if(!t||t.disabled){
    t=$(`#cartItems [data-change="${k.id}"]:not(:disabled)`);
    if(!t){
      const rows=$$("#cartItems .cart-row");
      if(rows.length){
        const r=rows[Math.min(Math.max(k.row,0),rows.length-1)];
        t=(k.remove?r.querySelector("[data-remove]"):r.querySelector(`[data-change][data-delta="${k.delta}"]:not(:disabled)`))||r.querySelector("button:not(:disabled)");
      }
    }
  }
  (t||$("#close")).focus();
}
function cartRowHTML(x){
  const atMax=x.qty>=MAX_QTY_PER_BOOK;
  return `<div class="cart-row"><div><b>${esc(x.title)}</b><small>${esc(x.author)} · ${money(x.price)}</small><p>`
    +`<button data-change="${esc(x.id)}" data-delta="-1">−</button> ${esc(x.qty)} `
    +`<button data-change="${esc(x.id)}" data-delta="1"${atMax?" disabled":""}>+</button> `
    +`<button data-remove="${esc(x.id)}">Remove</button></p>`
    +(atMax?`<small class="limit">Maximum ${MAX_QTY_PER_BOOK} per book</small>`:"")
    +`</div><b>${money(x.price*x.qty)}</b></div>`;
}
function cartSummaryHTML(total){
  return `<div class="summary"><b>Subtotal: ${money(total)}</b>`
    +`<p>${total>=FREE_DELIVERY_MIN?"You qualify for free delivery.":`Add ${money(FREE_DELIVERY_MIN-total)} for free delivery.`}</p>`
    +`<button id="checkout">Continue to checkout</button><small>Demo only — no payment is processed.</small></div>`;
}
function cartRender(){
  const focusKey=$("#drawer").hidden?null:cartFocusKey();
  $("#cartItems").innerHTML=state.cart.length?state.cart.map(cartRowHTML).join(""):"<p>Your bag is empty. Add a book to get started.</p>";
  const total=state.cart.reduce((n,x)=>n+x.price*x.qty,0);
  $("#summary").innerHTML=state.cart.length?cartSummaryHTML(total):"";
  if(focusKey)restoreCartFocus(focusKey);
}
function announceCart(message){$("#cartStatus").textContent=message}

/* ---- 8. UI controls ------------------------------------------------------- */
function setMenu(open){$("#nav").classList.toggle("open",open);$("#menu").setAttribute("aria-expanded",String(open))}
function openDrawer(){cartRender();announceCart("");$("#drawer").hidden=false;$("#close").focus()}
function closeDrawer(){if($("#drawer").hidden)return;$("#drawer").hidden=true;$("#cart").focus()}
function trapDrawerTab(e){
  if(e.key!=="Tab"||$("#drawer").hidden)return;
  const panel=$("#drawer aside"),f=[...panel.querySelectorAll("button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled)")];
  if(!f.length)return;
  const first=f[0],last=f[f.length-1],a=document.activeElement;
  if(!panel.contains(a)){e.preventDefault();first.focus()}
  else if(e.shiftKey&&a===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&a===last){e.preventDefault();first.focus()}
}

/* ---- 9. Newsletter -------------------------------------------------------- */
function emailError(raw){
  const v=raw.trim();
  if(!v)return EMAIL_REQUIRED_MESSAGE;
  const local=v.slice(0,v.lastIndexOf("@"));
  if(v.length>254||local.length>64||local.startsWith(".")||local.endsWith(".")||local.includes("..")||!EMAIL_RE.test(v))return EMAIL_INVALID_MESSAGE;
  return "";
}
function setNewsletterMessage(text,isError){
  const i=$("#email"),m=$("#newsletterMsg");
  if(m.textContent!==text)m.textContent=text;
  m.classList.toggle("error",isError);
  if(isError)i.setAttribute("aria-invalid","true");else i.removeAttribute("aria-invalid");
}

/* ---- 10. Event handlers --------------------------------------------------- */
function onGridClick(e){
  const a=e.target.closest("[data-add]"),w=e.target.closest("[data-wish]");
  if(a){
    const b=books.find(x=>x.id===+a.dataset.add);
    if(!b)return;
    if(addToCart(b.id)){updateBadges();toast(`${b.title} added to your bag`)}
    else toast(`Limit reached: you can buy up to ${MAX_QTY_PER_BOOK} copies of “${b.title}” per order.`);
  }
  if(w)toggleWishlist(+w.dataset.wish,w);
}
function categoryClick(e){
  const b=e.target.closest("[data-category]");
  if(!b)return;
  state.category=b.dataset.category;state.wishlistOnly=false;render();
  if($("#nav").classList.contains("open")){
    const fromNav=$("#nav").contains(b);
    setMenu(false);
    if(fromNav)$("#menu").focus();
  }
}
// The search text is stored immediately; only the re-render is debounced. An empty value renders at once.
function onSearchInput(e){
  state.search=e.target.value;
  clearTimeout(searchTimer);
  if(!state.search.trim())renderGrid();
  else searchTimer=setTimeout(renderGrid,SEARCH_DELAY_MS);
}
function onSortChange(e){state.sort=e.target.value;renderGrid()}
function onWishClick(){
  state.wishlistOnly=!state.wishlistOnly;state.category=ALL_BOOKS;
  render();
  $("#books").scrollIntoView({behavior:reduceMotion()?"auto":"smooth"});
  toast(state.wishlistOnly?"Showing wishlist":"Showing all books");
}
function onWishExitClick(){exitWishlist();$("#wish").focus();toast("Showing all books")}
function onEmptyActionClick(e){
  const act=e.currentTarget.dataset.action;
  if(act==="clear-search"){clearSearch();$("#search").focus()}
  else{state.search="";$("#search").value="";state.category=ALL_BOOKS;exitWishlist();$(`#pills [data-category="${ALL_BOOKS}"]`).focus()}
}
function onDrawerClick(e){if(e.target.id==="drawer")closeDrawer()}
function onCartItemsClick(e){
  const c=e.target.closest("[data-change]"),r=e.target.closest("[data-remove]");
  if(c)changeCartQty(+c.dataset.change,+c.dataset.delta);
  if(r)removeFromCart(+r.dataset.remove);
}
function onSummaryClick(e){if(e.target.id==="checkout")toast(CHECKOUT_DEMO_MESSAGE)}
function onMenuClick(){setMenu(!$("#nav").classList.contains("open"))}
function onDocumentClick(e){if($("#nav").classList.contains("open")&&!e.target.closest("#nav,#menu"))setMenu(false)}
function onSubscribeSubmit(e){
  e.preventDefault();
  const i=$("#email"),err=emailError(i.value);
  i.setCustomValidity(err);
  if(err){newsletterFailed=true;setNewsletterMessage(err,true);i.focus();return}
  newsletterFailed=false;i.setCustomValidity("");e.target.reset();setNewsletterMessage(NEWSLETTER_DEMO_MESSAGE,false);
}
function onEmailInput(e){
  const err=emailError(e.target.value);
  e.target.setCustomValidity(newsletterFailed?err:"");
  if(newsletterFailed)setNewsletterMessage(err,!!err);
  else setNewsletterMessage("",false);
}
function onKeydown(e){
  trapDrawerTab(e);
  if(e.key!=="Escape")return;
  if(!$("#drawer").hidden){closeDrawer();return}
  if($("#nav").classList.contains("open")){const inside=$("#nav").contains(document.activeElement);setMenu(false);if(inside)$("#menu").focus()}
}
// "storage" fires only in OTHER tabs of the same origin, never in the tab that wrote, so there is no echo loop.
function onStorage(e){if(e.key===STORAGE_KEY||e.key===null)syncFromStorage()}
// A page restored from the back/forward cache gets no storage events, so re-read on restore.
function onPageshow(e){if(e.persisted)syncFromStorage()}

/* ---- 11. Initialisation --------------------------------------------------- */
function buildPills(){
  $("#pills").innerHTML=CATEGORIES.map(x=>`<button data-category="${esc(x)}">${esc(x)}</button>`).join("");
}
function bindUiEvents(){
  $("#grid").addEventListener("click",onGridClick);
  $("#pills").addEventListener("click",categoryClick);$("#nav").addEventListener("click",categoryClick);
  $("#search").addEventListener("input",onSearchInput);
  $("#sort").addEventListener("change",onSortChange);
  $("#wish").addEventListener("click",onWishClick);
  $("#wishExit").addEventListener("click",onWishExitClick);
  $("#emptyAction").addEventListener("click",onEmptyActionClick);
  $("#cart").addEventListener("click",openDrawer);$("#close").addEventListener("click",closeDrawer);$("#drawer").addEventListener("click",onDrawerClick);
  $("#cartItems").addEventListener("click",onCartItemsClick);
  $("#summary").addEventListener("click",onSummaryClick);
  $("#menu").addEventListener("click",onMenuClick);
  document.addEventListener("click",onDocumentClick);
  $("#subscribe").addEventListener("submit",onSubscribeSubmit);
  $("#email").addEventListener("input",onEmailInput);
  document.addEventListener("keydown",onKeydown);
}
function bindStorageEvents(){
  window.addEventListener("storage",onStorage);
  window.addEventListener("pageshow",onPageshow);
}
// Same order as before the reorganisation: pills, listeners, saved state, storage listeners, first render.
function init(){
  buildPills();
  bindUiEvents();
  loadSavedState();
  bindStorageEvents();
  render();
}
init();
