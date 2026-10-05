const sampleCars=[
 {make:"Mazda",model:"Mazda3",year:"2014–2018",body:"Compact Sedan",engine:"2.0L I4",drive:"FWD",rarity:"Common",emoji:"🚗"},
 {make:"Honda",model:"Civic",year:"2022–2025",body:"Compact Sedan",engine:"1.5L Turbo I4",drive:"FWD",rarity:"Common",emoji:"🚙"},
 {make:"Honda",model:"Pilot",year:"2011–2018",body:"Compact SUV",engine:"2.0L I4",drive:"AWD",rarity:"Common",emoji:"🚛"},
 {make:"Ford",model:"Mustang GT",year:"2018–2023",body:"Sports Coupe",engine:"5.0L V8",drive:"RWD",rarity:"Rare",emoji:"🚘"},
 {make:"Porsche",model:"911 Carrera",year:"2020–2024",body:"Sports Car",engine:"3.0L Twin-Turbo H6",drive:"RWD",rarity:"Epic",emoji:"🏎️"},
 {make:"Toyota",model:"Corolla",year:"2014–2018",body:"Compact Sedan",engine:"1.8L I4",drive:"FWD",rarity:"Common",emoji:"🚙"}
];

let collection=[];
let selectedPhoto=false;
let currentResult=null;
let stream=null;

const $=id=>document.getElementById(id);

function render(){
 $("count").textContent=collection.length;
 $("uniqueCount").textContent=collection.length;
 $("makeCount").textContent=new Set(collection.map(c=>c.make)).size;
 $("rareCount").textContent=collection.filter(c=>c.rarity!=="Common").length;
 renderRecent();
 renderCollection();
}

function renderRecent(){
 const recent=collection.slice(-5).reverse();
 $("recent").innerHTML=recent.length?recent.map((c,i)=>miniCard(c,i)).join(""):`<div class="empty">No cars discovered yet<br>Scan your first car!</div>`;
}

function miniCard(c,i){
 return `<button class="mini-card" data-index="${collection.indexOf(c)}"><div class="mini-photo">${c.emoji}</div><b>${c.make} ${c.model}</b><small>${c.year}</small></button>`;
}

function renderCollection(){
 $("collectionGrid").innerHTML=collection.length?collection.slice().reverse().map((c,ri)=>`
 <button class="collection-card" data-index="${collection.length-1-ri}">
   <span class="rarity ${c.rarity.toLowerCase()}">${c.rarity}</span>
   <div class="car-photo">${c.emoji}</div>
   <h3>${c.make} ${c.model}</h3><p>${c.year}</p>
 </button>`).join(""):`<div class="empty" style="grid-column:1/-1">No cars yet.<br>Open Scan and identify a car.</div>`;

 document.querySelectorAll(".collection-card,.mini-card").forEach(el=>{
   el.addEventListener("click",()=>showDetail(collection[Number(el.dataset.index)]));
 });
}

function showDetail(car){
 $("detailContent").innerHTML=`<div class="detail-wrap">
 <div class="detail-photo">${car.emoji}</div>
 <h1 class="detail-title">${car.make} ${car.model}</h1>
 <div class="detail-year">${car.year} • ${car.rarity}</div>
 <div class="facts">
  <div class="fact"><small>BODY STYLE</small><b>${car.body}</b></div>
  <div class="fact"><small>ENGINE</small><b>${car.engine}</b></div>
  <div class="fact"><small>DRIVETRAIN</small><b>${car.drive}</b></div>
  <div class="fact"><small>MAKE</small><b>${car.make}</b></div>
 </div></div>`;
 showScreen("detail");
}

function showScreen(id){
 document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
 $(id).classList.add("active");
 document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.screen===id));
 window.scrollTo(0,0);
}

function openCamera(){
 if(!navigator.mediaDevices?.getUserMedia){
   $("photoInput").click();
   return;
 }
 navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false})
 .then(s=>{
   stream=s;
   $("camera").srcObject=s;
   $("cameraPlaceholder").style.display="none";
 })
 .catch(()=>$("photoInput").click());
}

function choosePhoto(){
 $("photoInput").click();
}

$("photoInput").addEventListener("change",e=>{
 const file=e.target.files?.[0];
 if(!file)return;
 const url=URL.createObjectURL(file);
 $("preview").src=url;
 $("camera-card");
 document.querySelector(".camera-card").classList.add("has-preview");
 selectedPhoto=true;
 $("identifyBtn").disabled=false;
 $("cameraPlaceholder").style.display="none";
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
});

$("identifyBtn").addEventListener("click",()=>{
 // Replace this function with a real backend request to a vision model.
 currentResult=sampleCars[Math.floor(Math.random()*sampleCars.length)];
 $("resultImage").textContent=currentResult.emoji;
 $("resultText").innerHTML=`
   <div class="result-name">${currentResult.make} ${currentResult.model}</div>
   <div class="result-meta">${currentResult.year} • ${currentResult.body}</div>
   <div class="confidence">✓ IDENTIFICATION SUCCESSFUL</div>`;
 $("resultModal").classList.remove("hidden");
});

$("collectBtn").addEventListener("click",()=>{
 if(!currentResult)return;
 const exists=collection.some(c=>c.make===currentResult.make&&c.model===currentResult.model&&c.year===currentResult.year);
 if(!exists)collection.push({...currentResult});
 $("resultModal").classList.add("hidden");
 resetScan();
 render();
 showScreen("collection");
});

function resetScan(){
 selectedPhoto=false;
 $("identifyBtn").disabled=true;
 $("preview").src="";
 document.querySelector(".camera-card").classList.remove("has-preview");
 $("cameraPlaceholder").style.display="flex";
 $("photoInput").value="";
 if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
}

$("cameraBtn").addEventListener("click",openCamera);
$("photoBtn").addEventListener("click",choosePhoto);
$("scanHero").addEventListener("click",()=>showScreen("scan"));
$("viewAll").addEventListener("click",()=>showScreen("collection"));
$("backDetail").addEventListener("click",()=>showScreen("collection"));
$("closeResult").addEventListener("click",()=>$("resultModal").classList.add("hidden"));
$("retakeBtn").addEventListener("click",()=>{$("resultModal").classList.add("hidden");resetScan();});

document.querySelectorAll(".nav").forEach(btn=>btn.addEventListener("click",()=>showScreen(btn.dataset.screen)));

render();
