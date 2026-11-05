const all = require("all-the-cities");
const US = {AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"};
// Canada: only provinces where MacroSnaps has its own crews
const CA = {"08":["ON","Ontario"],"10":["QC","Quebec"]};
const REGION = {CT:"Northeast",ME:"Northeast",MA:"Northeast",NH:"Northeast",RI:"Northeast",VT:"Northeast",NJ:"Mid-Atlantic",NY:"Northeast",PA:"Mid-Atlantic",DE:"Mid-Atlantic",MD:"Mid-Atlantic",DC:"Mid-Atlantic",VA:"Mid-Atlantic",WV:"Mid-Atlantic",IL:"Midwest",IN:"Midwest",MI:"Midwest",OH:"Midwest",WI:"Midwest",IA:"Midwest",KS:"Midwest",MN:"Midwest",MO:"Midwest",NE:"Midwest",ND:"Midwest",SD:"Midwest",AL:"South",AR:"South",FL:"Southeast",GA:"Southeast",KY:"South",LA:"South",MS:"South",NC:"Southeast",SC:"Southeast",TN:"South",OK:"South",TX:"South",AZ:"Southwest",NM:"Southwest",NV:"West",CO:"Mountain West",ID:"Mountain West",MT:"Mountain West",UT:"Mountain West",WY:"Mountain West",AK:"West",CA:"West Coast",HI:"West",OR:"Pacific Northwest",WA:"Pacific Northwest"};
const OK = new Set(["PPL","PPLA","PPLA2","PPLA3","PPLA4","PPLC","PPLS"]);
const slugify = s => s.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const hav=(a,b)=>{const R=3958.8,t=x=>x*Math.PI/180;const[lo1,la1]=a,[lo2,la2]=b;const d=Math.sin(t(la2-la1)/2)**2+Math.cos(t(la1))*Math.cos(t(la2))*Math.sin(t(lo2-lo1)/2)**2;return Math.round(2*R*Math.asin(Math.sqrt(d)));};
const regions=[]; const cities=[];
const BLOCK={NY:["West Albany","Queens Village","Wakefield","Far Rockaway"],CT:["North Stamford","East Norwalk","West Torrington"],GA:["North Atlanta"],HI:["Hālawa Heights"],ME:["West Scarborough","South Portland Gardens","Wells Beach Station"],MN:["West Coon Rapids"],MS:["West Gulfport"],MO:["East Independence"],NH:["East Concord","Derry Village"],TN:["East Chattanooga","East Brainerd"],WI:["North La Crosse"],KY:["Valley Station","Ironville","Meads","Lexington-Fayette"],AL:["East Florence"],WV:["Weirton Heights"],RI:["North Scituate"],TX:["Alief"],AZ:["Maryvale","Deer Valley","Ahwatukee Foothills","Tempe Junction","Alhambra"],IL:["North Peoria"],MA:["Framingham Center","North Chicopee","South Peabody","Beverly Cove"],WA:["City of Sammamish","West Lake Sammamish"],NJ:["South Vineland","Sayreville Junction"],VA:["Portsmouth Heights","South Suffolk","West Lynchburg","East Hampton"],MD:["Saint Charles"],BC:["West End","Ladner"]};
const NYC=[-74.006,40.7143], BORO=new Set(["New York City","Brooklyn","Queens","Manhattan","The Bronx","Staten Island"]);
const clean = n => n.replace(/^City of (.*?) \(balance\)$/,"$1");
function take(list, n, minPop, st){const seen=new Set();const out=[];
 for(const c of list.sort((a,b)=>b.population-a.population)){
  if(!OK.has(c.featureCode))continue; const k=slugify(clean(c.name)); if(seen.has(k))continue;
  if((BLOCK[st]||[]).includes(c.name))continue;
  if(st==="NY"&&!BORO.has(c.name)&&hav(NYC,c.loc.coordinates)<14)continue;
  if(/^(Saint|St\.?) /.test(c.name)&&seen.has(slugify(c.name.replace(/^(Saint|St\.?) /,"st-"))))continue;
  if(/^(Saint|St\.?) /.test(c.name)&&seen.has(slugify(c.name.replace(/^(Saint|St\.?) /,"saint-"))))continue;
  if(out.some(o=>{const m=(/^(.*) (Center|Junction|Cove|Station)$/.exec(c.name)||/^(?:City of|West Lake) (.*)$/.exec(c.name));return m&&o.name===m[1];}))continue;
  if(out.length>=n)break; if(out.length>=8&&c.population<minPop)break;
  seen.add(k); out.push(c);}
 return out;}
for(const [code,name] of Object.entries(US)){
  const list = all.filter(c=>c.country==="US"&&c.adminCode===code);
  const picked = code==="DC" ? [{name:"Washington",population:689545,loc:{coordinates:[-77.0369,38.9072]},cityId:4140963}] : take(list,40,10000,code);
  regions.push({country:"us",code,name,slug:slugify(name),region:REGION[code]});
  picked.forEach((c,i)=>cities.push({id:c.cityId,name:code==="DC"?"Washington, DC":clean(c.name),country:"us",state:code,stateName:name,stateSlug:slugify(name),slug:code==="DC"?"washington-dc":`${slugify(clean(c.name))}-${code.toLowerCase()}`,population:c.population,rank:i+1,lat:c.loc.coordinates[1],lng:c.loc.coordinates[0]}));
}
for(const [adm,[code,name]] of Object.entries(CA)){
  const list = all.filter(c=>c.country==="CA"&&c.adminCode===adm);
  const n = 40;
  const picked = take(list,n,5000,code);
  regions.push({country:"canada",code,name,slug:slugify(name),region:"Canada"});
  picked.forEach((c,i)=>cities.push({id:c.cityId,name:c.name,country:"canada",state:code,stateName:name,stateSlug:slugify(name),slug:`${slugify(c.name)}-${code.toLowerCase()}`,population:c.population,rank:i+1,lat:c.loc.coordinates[1],lng:c.loc.coordinates[0]}));
}
const studios={nyc:[-73.9845,40.7577],dc:[-77.0326,38.9014]};
for(const c of cities){
  const p=[c.lng,c.lat];
  c.nearby=cities.filter(o=>o!==c&&o.country===c.country).map(o=>({slug:o.slug,name:o.name,state:o.state,mi:hav(p,[o.lng,o.lat])})).filter(o=>o.mi<=120).sort((a,b)=>a.mi-b.mi).slice(0,8);
  c.studioMiles={nyc:hav(p,studios.nyc),dc:hav(p,studios.dc)};
}
for(const c of cities){c.lat=+c.lat.toFixed(4); c.lng=+c.lng.toFixed(4);}
const s=new Set();for(const c of cities){if(s.has(c.slug))console.error("DUP",c.slug);s.add(c.slug);}
require("fs").writeFileSync("/home/claude/macrosnaps/src/data/regions.json",JSON.stringify(regions));
require("fs").writeFileSync("/home/claude/macrosnaps/src/data/cities.json",JSON.stringify(cities));
console.log("regions",regions.length,"cities",cities.length,"us",cities.filter(c=>c.country==="us").length,"ca",cities.filter(c=>c.country==="canada").length);
