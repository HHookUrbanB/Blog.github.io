(function(root){'use strict';
const norm=s=>String(s??'').normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]+/gu,'');
const tokens=q=>String(q||'').trim().split(/\s+/).map(norm).filter(Boolean);
function blob(r){return norm([r.title,...r.aliases,...r.directors,...r.cast,...r.genres,...r.countries,r.year,r.original_release_year].join(' '));}
function filter(records,state){const query=tokens(state.q);return records.filter(r=>{
 if(r.kind!==(state.kind==='shows'?'show':'movie'))return false;
 if(query.some(t=>!blob(r).includes(t)))return false;
 if(state.genre&&!r.genres.includes(state.genre))return false;
 if(state.country==='unknown'&&r.countries.length)return false;
 if(state.country&&state.country!=='unknown'&&!r.countries.includes(state.country))return false;
 if(state.decade==='unknown'&&r.year!==null)return false;
 if(state.decade&&state.decade!=='unknown'&&Math.floor(r.year/10)*10!==Number(state.decade))return false;
 const d=r.runtime_minutes;
 if(state.kind!=='shows'&&state.runtime){if(state.runtime==='unknown'){if(d!==null)return false;}else{if(d===null)return false;if(state.runtime==='short'&&d>=90)return false;if(state.runtime==='medium'&&(d<90||d>=120))return false;if(state.runtime==='long'&&(d<120||d>=180))return false;if(state.runtime==='epic'&&d<180)return false;}}
 if(state.verification==='enriched'&&r.verification_status!=='has_external_sources')return false;
 if(state.verification==='identity'&&r.verification_status!=='needs_identity_review')return false;
 if(state.verification==='original'&&r.verification_status!=='saved_only')return false;
 if(state.verification==='core-gap'&&!r.missing_fields.some(f=>(r.kind==='movie'?['year','directors','genres','runtime_minutes']:['year','genres','episodes']).includes(f)))return false;
 return true;});}
function sorted(records,order){return records.slice().sort((a,b)=>{let diff=0;
 if(order==='year-desc'||order==='year-asc'){if(a.year===null&&b.year!==null)return 1;if(b.year===null&&a.year!==null)return -1;diff=(a.year-b.year)*(order==='year-desc'?-1:1);}
 if(order==='runtime-asc'){if(a.runtime_minutes===null&&b.runtime_minutes!==null)return 1;if(b.runtime_minutes===null&&a.runtime_minutes!==null)return -1;diff=a.runtime_minutes-b.runtime_minutes;}
 return diff||a.title.localeCompare(b.title,'zh-Hans-CN')||a.id.localeCompare(b.id);});}
const defaults={kind:'movies',q:'',genre:'',decade:'',country:'',runtime:'',verification:'',sort:'title',view:'grid',page:1};
function parse(search){const p=new URLSearchParams(search),s={...defaults};for(const k of Object.keys(defaults))if(p.has(k))s[k]=p.get(k);s.kind=s.kind==='shows'?'shows':'movies';s.page=Math.max(1,parseInt(s.page,10)||1);s.sort=['title','year-desc','year-asc','runtime-asc'].includes(s.sort)?s.sort:'title';s.view=s.view==='list'?'list':'grid';if(s.kind==='shows')s.runtime='';return s;}
function serialize(s){const p=new URLSearchParams();for(const k of Object.keys(defaults))if(String(s[k])!==String(defaults[k])&&s[k]!==''&&s[k]!==undefined)p.set(k,s[k]);return p.toString();}
const api={norm,filter,sorted,parse,serialize,defaults};root.MovieCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window==='undefined'?globalThis:window);
