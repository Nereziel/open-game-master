
function czechMonsterWorkbench() {
 const labels={"Armor Class":"OČ","Hit Points":"Životy","Speed":"Rychlost","Saving Throws":"Záchranné hody","Skills":"Dovednosti","Damage Vulnerabilities":"Zranitelnosti vůči zranění","Damage Resistances":"Odolnosti vůči zranění","Damage Immunities":"Imunity vůči zranění","Condition Immunities":"Imunity vůči stavům","Senses":"Smysly","Languages":"Jazyky","Challenge":"Nebezpečnost"};
 const types={"aberration":"aberace","beast":"zvíře","celestial":"nebešťan","construct":"konstrukt","dragon":"drak","elemental":"elementál","fey":"víla","fiend":"běs","giant":"obr","humanoid":"humanoid","monstrosity":"zrůda","ooze":"sliz","plant":"rostlina","undead":"nemrtvý"};
 const sizes={"Tiny":"Drobný","Small":"Malý","Medium":"Střední","Large":"Velký","Huge":"Obrovský","Gargantuan":"Gigantický"};
 const aligns={"chaotic evil":"chaoticky zlý","lawful evil":"zákonně zlý","neutral evil":"neutrálně zlý","chaotic good":"chaoticky dobrý","lawful good":"zákonně dobrý","neutral good":"neutrálně dobrý","lawful neutral":"zákonně neutrální","chaotic neutral":"chaoticky neutrální","neutral":"neutrální","unaligned":"bez přesvědčení","any alignment":"libovolné přesvědčení"};
 const skills={"Acrobatics":"Akrobacie","Animal Handling":"Zacházení se zvířaty","Arcana":"Arkánum","Athletics":"Atletika","Deception":"Klamání","History":"Historie","Insight":"Vhled","Intimidation":"Zastrašování","Investigation":"Pátrání","Medicine":"Lékařství","Nature":"Příroda","Perception":"Vnímání","Performance":"Vystupování","Persuasion":"Přesvědčování","Religion":"Náboženství","Sleight of Hand":"Čachry","Stealth":"Nenápadnost","Survival":"Přežití"};
 const languages={"Common":"obecná řeč","Draconic":"dračí řeč","Abyssal":"abysština","Celestial":"nebešťanština","Deep Speech":"hlubinná řeč","Dwarvish":"trpasličtina","Elvish":"elfština","Giant":"obřina","Goblin":"goblinština","Infernal":"pekelština","Primordial":"prvotní řeč","Sylvan":"sylvánština","Terran":"zemština","Aquan":"vodština","Auran":"vzduština","Ignan":"ohnivština"};
 const abils={"Str":"Sil","Dex":"Obr","Con":"Odl","Int":"Int","Wis":"Mdr","Cha":"Cha"};
 const dmg={"acid":"kyselinové","bludgeoning":"drtivé","cold":"chladné","fire":"ohnivé","force":"silové","lightning":"bleskové","necrotic":"nekrotické","piercing":"bodné","poison":"jedové","psychic":"psychické","radiant":"zářivé","slashing":"sečné","thunder":"hromové"};
 const cond={"blinded":"oslepení","charmed":"zmámení","deafened":"ohluchnutí","exhaustion":"vyčerpání","frightened":"vystrašení","grappled":"uchvácení","incapacitated":"neschopnost","invisible":"neviditelnost","paralyzed":"paralýza","petrified":"zkamenění","poisoned":"otrávení","prone":"sražení k zemi","restrained":"zadržení","stunned":"ochromení","unconscious":"bezvědomí"};
 function replace(x, obj){for(const [k,v] of Object.entries(obj))x=x.split(k).join(v);return x;}
 function automatic(l){
  if(!l||l.startsWith("|:")||l.startsWith("| ")&& !l.startsWith("| STR"))return l;
  if(l.startsWith("| STR"))return replace(l,{"STR":"SIL","DEX":"OBR","CON":"ODL","WIS":"MDR"});
  const h={"###### Actions":"###### Akce","###### Reactions":"###### Reakce","###### Legendary Actions":"###### Legendární akce","###### Lair Actions":"###### Akce doupěte","###### Regional Effects":"###### Regionální účinky"};
  if(h[l])return h[l];
  const meta=l.match(/^\*(Tiny|Small|Medium|Large|Huge|Gargantuan) ([^,]+), (.+)\*$/);
  if(meta){const t=meta[2].match(/^([a-z]+)(.*)$/); if(t&&types[t[1]]&&aligns[meta[3]])return "*"+sizes[meta[1]]+" "+types[t[1]]+t[2].replace("(any race)","(libovolná rasa)")+", "+aligns[meta[3]]+"*";return null;}
  const m=l.match(/^\*\*([^*]+)\*\* (.*)$/);
  if(m&&labels[m[1]]) {let x=m[2],key=m[1];
   if(key==="Armor Class")x=replace(x,{"natural armor":"přirozená zbroj","leather armor":"kožená zbroj","studded leather":"pobíjená kožená zbroj","chain mail":"kroužková zbroj","plate":"plátová zbroj","shield":"štít","hide armor":"kožešinová zbroj","mage armor":"mágova zbroj","breastplate":"kyrys"});
   if(key==="Speed")x=x.replace(/(fly|burrow|swim|climb) (\d+) ft\./g,(_,a,n)=>({"fly":"létání","burrow":"hrabání","swim":"plavání","climb":"šplhání"})[a]+" "+n+" stop").replace(/ft\./g,"stop").replace("hover","vznášení");
   if(key==="Saving Throws")x=replace(x,abils);
   if(key==="Skills")x=replace(x,skills);
   if(key.startsWith("Damage"))x=replace(x,dmg).replace("from nonmagical attacks that aren't silvered","z nemagických útoků, které nejsou vedené postříbřenými zbraněmi").replace("from nonmagical attacks","z nemagických útoků");
   if(key==="Condition Immunities")x=replace(x,cond);
   if(key==="Senses")x=replace(x,{"passive Perception":"pasivní Vnímání","blindsight":"slepozrak","darkvision":"vidění ve tmě","tremorsense":"otřesocit","truesight":"pravdivé vidění"}).replace(/ft\./g,"stop");
   if(key==="Languages")x=replace(x,languages).replace(/telepathy (\d+) ft\./g,"telepatie $1 stop").replace("any one language (usually obecná řeč)","libovolný jeden jazyk (obvykle obecná řeč)").replace("any two languages","libovolné dva jazyky").replace("understands","rozumí").replace("but can't speak","ale nedokáže mluvit");
   if(key==="Challenge")x=x.replace("XP","ZK");
   return "**"+labels[key]+"** "+x;
  }
  return null;
 }
 function analyze(pages){return pages.map(p=>({id:p.id,pending:p.md.split("\n").map((text,i)=>({i,text})).filter(o=>automatic(o.text)===null)}));}
 function materialize(pages,translations) {let out=[];for(const p of pages){let pending=analyze([p])[0].pending;const tr=translations[p.id];if(!tr||tr.length!==pending.length)throw Error("Missing/wrong translation count for "+p.id+": "+(tr&&tr.length)+" vs "+pending.length);
  let index=0;const cz=p.md.split("\n").map(l=>automatic(l)??tr[index++]).join("\n");
  if(tr.some(t=>!t||/TODO|UNHANDLED/.test(t)))throw Error("Blank/placeholder "+p.id);
  const numbers=x=>(x.match(/\d+(?:,\d+)?(?:d\d+)?/g)||[]).sort();const a=numbers(p.md),b=numbers(cz);if(a.length!==b.length||a.some((n,i)=>n!==b[i]))throw Error("Number mismatch "+p.id+"\nEN "+a+"\nCZ "+b);
  out.push({id:p.id,md:cz});}return out;
 }
 return {automatic,analyze,materialize};
}
czechMonsterWorkbench();
