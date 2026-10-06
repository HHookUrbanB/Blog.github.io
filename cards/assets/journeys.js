/* Deterministic public-data adapter. No prices, storage, networking or new catalog identities. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.CatalogJourneys = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const copy = x => JSON.parse(JSON.stringify(x));
  const casefold = text => Array.from(text).map(c => CASEFOLD[c] || c.toLowerCase()).join('');
  const CASEFOLD = {"µ":"μ","ß":"ss","ŉ":"ʼn","ſ":"s","ǰ":"ǰ","ͅ":"ι","ΐ":"ΐ","ΰ":"ΰ","ς":"σ","ϐ":"β","ϑ":"θ","ϕ":"φ","ϖ":"π","ϰ":"κ","ϱ":"ρ","ϵ":"ε","և":"եւ","Ꭰ":"Ꭰ","Ꭱ":"Ꭱ","Ꭲ":"Ꭲ","Ꭳ":"Ꭳ","Ꭴ":"Ꭴ","Ꭵ":"Ꭵ","Ꭶ":"Ꭶ","Ꭷ":"Ꭷ","Ꭸ":"Ꭸ","Ꭹ":"Ꭹ","Ꭺ":"Ꭺ","Ꭻ":"Ꭻ","Ꭼ":"Ꭼ","Ꭽ":"Ꭽ","Ꭾ":"Ꭾ","Ꭿ":"Ꭿ","Ꮀ":"Ꮀ","Ꮁ":"Ꮁ","Ꮂ":"Ꮂ","Ꮃ":"Ꮃ","Ꮄ":"Ꮄ","Ꮅ":"Ꮅ","Ꮆ":"Ꮆ","Ꮇ":"Ꮇ","Ꮈ":"Ꮈ","Ꮉ":"Ꮉ","Ꮊ":"Ꮊ","Ꮋ":"Ꮋ","Ꮌ":"Ꮌ","Ꮍ":"Ꮍ","Ꮎ":"Ꮎ","Ꮏ":"Ꮏ","Ꮐ":"Ꮐ","Ꮑ":"Ꮑ","Ꮒ":"Ꮒ","Ꮓ":"Ꮓ","Ꮔ":"Ꮔ","Ꮕ":"Ꮕ","Ꮖ":"Ꮖ","Ꮗ":"Ꮗ","Ꮘ":"Ꮘ","Ꮙ":"Ꮙ","Ꮚ":"Ꮚ","Ꮛ":"Ꮛ","Ꮜ":"Ꮜ","Ꮝ":"Ꮝ","Ꮞ":"Ꮞ","Ꮟ":"Ꮟ","Ꮠ":"Ꮠ","Ꮡ":"Ꮡ","Ꮢ":"Ꮢ","Ꮣ":"Ꮣ","Ꮤ":"Ꮤ","Ꮥ":"Ꮥ","Ꮦ":"Ꮦ","Ꮧ":"Ꮧ","Ꮨ":"Ꮨ","Ꮩ":"Ꮩ","Ꮪ":"Ꮪ","Ꮫ":"Ꮫ","Ꮬ":"Ꮬ","Ꮭ":"Ꮭ","Ꮮ":"Ꮮ","Ꮯ":"Ꮯ","Ꮰ":"Ꮰ","Ꮱ":"Ꮱ","Ꮲ":"Ꮲ","Ꮳ":"Ꮳ","Ꮴ":"Ꮴ","Ꮵ":"Ꮵ","Ꮶ":"Ꮶ","Ꮷ":"Ꮷ","Ꮸ":"Ꮸ","Ꮹ":"Ꮹ","Ꮺ":"Ꮺ","Ꮻ":"Ꮻ","Ꮼ":"Ꮼ","Ꮽ":"Ꮽ","Ꮾ":"Ꮾ","Ꮿ":"Ꮿ","Ᏸ":"Ᏸ","Ᏹ":"Ᏹ","Ᏺ":"Ᏺ","Ᏻ":"Ᏻ","Ᏼ":"Ᏼ","Ᏽ":"Ᏽ","ᏸ":"Ᏸ","ᏹ":"Ᏹ","ᏺ":"Ᏺ","ᏻ":"Ᏻ","ᏼ":"Ᏼ","ᏽ":"Ᏽ","ᲀ":"в","ᲁ":"д","ᲂ":"о","ᲃ":"с","ᲄ":"т","ᲅ":"т","ᲆ":"ъ","ᲇ":"ѣ","ᲈ":"ꙋ","ẖ":"ẖ","ẗ":"ẗ","ẘ":"ẘ","ẙ":"ẙ","ẚ":"aʾ","ẛ":"ṡ","ẞ":"ss","ὐ":"ὐ","ὒ":"ὒ","ὔ":"ὔ","ὖ":"ὖ","ᾀ":"ἀι","ᾁ":"ἁι","ᾂ":"ἂι","ᾃ":"ἃι","ᾄ":"ἄι","ᾅ":"ἅι","ᾆ":"ἆι","ᾇ":"ἇι","ᾈ":"ἀι","ᾉ":"ἁι","ᾊ":"ἂι","ᾋ":"ἃι","ᾌ":"ἄι","ᾍ":"ἅι","ᾎ":"ἆι","ᾏ":"ἇι","ᾐ":"ἠι","ᾑ":"ἡι","ᾒ":"ἢι","ᾓ":"ἣι","ᾔ":"ἤι","ᾕ":"ἥι","ᾖ":"ἦι","ᾗ":"ἧι","ᾘ":"ἠι","ᾙ":"ἡι","ᾚ":"ἢι","ᾛ":"ἣι","ᾜ":"ἤι","ᾝ":"ἥι","ᾞ":"ἦι","ᾟ":"ἧι","ᾠ":"ὠι","ᾡ":"ὡι","ᾢ":"ὢι","ᾣ":"ὣι","ᾤ":"ὤι","ᾥ":"ὥι","ᾦ":"ὦι","ᾧ":"ὧι","ᾨ":"ὠι","ᾩ":"ὡι","ᾪ":"ὢι","ᾫ":"ὣι","ᾬ":"ὤι","ᾭ":"ὥι","ᾮ":"ὦι","ᾯ":"ὧι","ᾲ":"ὰι","ᾳ":"αι","ᾴ":"άι","ᾶ":"ᾶ","ᾷ":"ᾶι","ᾼ":"αι","ι":"ι","ῂ":"ὴι","ῃ":"ηι","ῄ":"ήι","ῆ":"ῆ","ῇ":"ῆι","ῌ":"ηι","ῒ":"ῒ","ΐ":"ΐ","ῖ":"ῖ","ῗ":"ῗ","ῢ":"ῢ","ΰ":"ΰ","ῤ":"ῤ","ῦ":"ῦ","ῧ":"ῧ","ῲ":"ὼι","ῳ":"ωι","ῴ":"ώι","ῶ":"ῶ","ῷ":"ῶι","ῼ":"ωι","ꭰ":"Ꭰ","ꭱ":"Ꭱ","ꭲ":"Ꭲ","ꭳ":"Ꭳ","ꭴ":"Ꭴ","ꭵ":"Ꭵ","ꭶ":"Ꭶ","ꭷ":"Ꭷ","ꭸ":"Ꭸ","ꭹ":"Ꭹ","ꭺ":"Ꭺ","ꭻ":"Ꭻ","ꭼ":"Ꭼ","ꭽ":"Ꭽ","ꭾ":"Ꭾ","ꭿ":"Ꭿ","ꮀ":"Ꮀ","ꮁ":"Ꮁ","ꮂ":"Ꮂ","ꮃ":"Ꮃ","ꮄ":"Ꮄ","ꮅ":"Ꮅ","ꮆ":"Ꮆ","ꮇ":"Ꮇ","ꮈ":"Ꮈ","ꮉ":"Ꮉ","ꮊ":"Ꮊ","ꮋ":"Ꮋ","ꮌ":"Ꮌ","ꮍ":"Ꮍ","ꮎ":"Ꮎ","ꮏ":"Ꮏ","ꮐ":"Ꮐ","ꮑ":"Ꮑ","ꮒ":"Ꮒ","ꮓ":"Ꮓ","ꮔ":"Ꮔ","ꮕ":"Ꮕ","ꮖ":"Ꮖ","ꮗ":"Ꮗ","ꮘ":"Ꮘ","ꮙ":"Ꮙ","ꮚ":"Ꮚ","ꮛ":"Ꮛ","ꮜ":"Ꮜ","ꮝ":"Ꮝ","ꮞ":"Ꮞ","ꮟ":"Ꮟ","ꮠ":"Ꮠ","ꮡ":"Ꮡ","ꮢ":"Ꮢ","ꮣ":"Ꮣ","ꮤ":"Ꮤ","ꮥ":"Ꮥ","ꮦ":"Ꮦ","ꮧ":"Ꮧ","ꮨ":"Ꮨ","ꮩ":"Ꮩ","ꮪ":"Ꮪ","ꮫ":"Ꮫ","ꮬ":"Ꮬ","ꮭ":"Ꮭ","ꮮ":"Ꮮ","ꮯ":"Ꮯ","ꮰ":"Ꮰ","ꮱ":"Ꮱ","ꮲ":"Ꮲ","ꮳ":"Ꮳ","ꮴ":"Ꮴ","ꮵ":"Ꮵ","ꮶ":"Ꮶ","ꮷ":"Ꮷ","ꮸ":"Ꮸ","ꮹ":"Ꮹ","ꮺ":"Ꮺ","ꮻ":"Ꮻ","ꮼ":"Ꮼ","ꮽ":"Ꮽ","ꮾ":"Ꮾ","ꮿ":"Ꮿ","ﬀ":"ff","ﬁ":"fi","ﬂ":"fl","ﬃ":"ffi","ﬄ":"ffl","ﬅ":"st","ﬆ":"st","ﬓ":"մն","ﬔ":"մե","ﬕ":"մի","ﬖ":"վն","ﬗ":"մխ"};
  function queryRoutes(query, m) {
    if (!query || typeof query !== 'object' || Array.isArray(query)) throw new Error('query must be an object');
    const q = copy(query), allowed = new Set(['goal','domain','language','subject','styles','budget_ceiling','target_card_id','requested_finish','result_limit']);
    const unknown = Object.keys(q).filter(k => !allowed.has(k));
    if (unknown.length) throw new Error('Unsupported inputs: ' + unknown.sort().join(', '));
    if (!m.input_contract.goal.includes(q.goal)) throw new Error('goal is required: character, art, or opening');
    if (!m.input_contract.domain.includes(q.domain)) throw new Error('domain is required: basketball or pokemon');
    if (!m.input_contract.language.includes(q.language === undefined ? 'any' : q.language)) throw new Error('Unsupported language');
    if (q.styles !== undefined && (!Array.isArray(q.styles) || !q.styles.every(x => typeof x === 'string'))) throw new Error('styles must be an array of strings');
    for (const field of ['subject','target_card_id','requested_finish']) if (q[field] != null && typeof q[field] !== 'string') throw new Error(field + ' must be a string');
    const limit = q.result_limit === undefined ? 6 : q.result_limit;
    if (!Number.isInteger(limit) || limit < 1 || limit > 20) throw new Error('result_limit must be an integer from 1 to 20');
    const budget = q.budget_ceiling ?? null;
    if (budget !== null) {
      if (typeof budget !== 'object' || Array.isArray(budget) || Object.keys(budget).sort().join(',') !== 'amount,currency') throw new Error('budget_ceiling requires only amount and currency');
      // Check the original value as JSON cloning changes NaN/Infinity to null.
      if (typeof query.budget_ceiling.amount !== 'number' || !Number.isFinite(query.budget_ceiling.amount) || query.budget_ceiling.amount < 0) throw new Error('budget amount must be finite and nonnegative');
      if (typeof budget.currency !== 'string' || !/^\p{L}{3}$/u.test(budget.currency)) throw new Error('currency must be a three-letter code');
    }
    const aliases = Object.fromEntries(Object.entries(m.subject_aliases).map(([k,v]) => [casefold(k),v]));
    const folded = casefold(q.subject || '');
    const subject = Object.hasOwn(aliases,folded) ? aliases[folded] : folded;
    const goal = q.goal, exact = q.target_card_id, warnings = [];
    let effectiveGoal = goal;
    if (goal === 'opening' && exact) { warnings.push('你指定了单一卡号：先看单卡目标。这里不能推荐某包保证抽中它。'); effectiveGoal = 'character'; }
    const results = m.candidates.filter(c => c.goals.includes(effectiveGoal) && c.domain === q.domain &&
      ((q.language || 'any') === 'any' || q.language === c.language) && (!subject || c.subject_keys.includes(subject)) &&
      (q.styles || []).every(s => c.style_tags.includes(s)) && (!exact || c.card_refs.some(r => r.id === exact)));
    const count = results.length;
    if (q.requested_finish) warnings.push('工艺要求已保留，但本路线没有验证所有单卡工艺或各盒可抽性；请打开对应版本证据，不从稀有度推导。');
    if (subject && goal === 'opening' && !count) warnings.push('本开包入口没有验证“指定角色→具体包装”的完整关系；可切换“收喜欢的角色”先列目标。');
    if (budget !== null) warnings.push('预算是你输入的上限；候选没有实时总价，因此尚未判断是否在预算内。');
    if (!count) warnings.push('本模型暂未覆盖这个组合；不代表不存在符合条件的卡或产品。');
    const selected = copy(results.slice(0,limit)), ids = [...new Set(selected.flatMap(c => c.source_ids))].sort();
    return {schema_version:'1.0-beginner-route-output',query:q,normalized_subject:subject || null,effective_goal:effectiveGoal,
      route:copy(m.routes.find(r => r.id === effectiveGoal)),candidate_count_in_current_coverage:count,returned_count:selected.length,
      truncated:count > limit,ordering:'declared_editorial_comparison_order_not_value_or_odds_ranking',candidates:selected,warnings_zh:warnings,
      coverage_note_zh:m.coverage_note_zh,source_ids:ids,sources:copy(m.sources.filter(s => ids.includes(s.id))),budget_ceiling:budget,
      budget_fit:'not_assessed_current_total_required',market_prices_checked:false,purchase_performed:false,unmatched_means_absent:false,
      variant_verification_required:!!q.requested_finish};
  }
  const numberKey = n => String(n ?? '').split('/')[0].replace(/^0+(?=\d)/,'');
  function resolveCardRef(ref, data) {
    let candidates = [];
    if (ref.id && ref.card_number != null) { const c = data.resolveCard(ref.id); if (c) candidates = [c]; }
    else if (ref.composite_locator) {
      const l = ref.composite_locator;
      candidates = data.cards.filter(c => c.original.edition_id === l.edition_id && c.subset === l.card_set_original && String(c.number) === l.checklist_card_number && c.name === l.athlete);
    }
    const set = ref.namespace_id || ref.set_id || ref.product_id;
    candidates = candidates.filter(c => (!String(ref.card_number).includes('/') || String(ref.card_number).split('/')[1] === String(c.original.base_denominator ?? c.original.printed_denominator ?? String(c.number).split('/')[1])) && (!set || c.set_id === set) && c.name === ref.subject && numberKey(c.number) === numberKey(ref.card_number) && (!ref.rarity || c.rarity === ref.rarity) && (!ref.card_set || c.subset === ref.card_set));
    if (candidates.length !== 1) return {status:'research_reference_only',canonical_card_id:null,reference_id:ref.id || null,reason_zh:ref.card_number == null ? '卡号尚未核实；仅打开研究来源，不猜对应卡表位置。' : '尚未与目录中的唯一完整身份对齐；仅打开研究来源。'};
    const c = candidates[0];
    return {status:ref.composite_locator?'exact_composite_locator':'exact_existing_identity',canonical_card_id:c.id,reference_id:ref.id || null,
      source_grade:c.source_grade || 'official_primary',proof_level:c.proof_level,confirmed_product_ids:[...c.product_ids],set_id:c.set_id,
      research_context_ids:[...(c.research_context_ids || [])],availability_scope:c.original.availability_scope || null,
      identity_is_physical_specimen_proof:false,identity_is_all_finishes_proof:false};
  }
  function resolveEntityRef(ref, data) {
    const exact = data.products.filter(p => p.id === ref.id || (ref.kind === 'edition' && p.detail.edition_id === ref.id));
    if (ref.kind === 'research_product_context') return {kind:ref.kind,reference_id:ref.id,status:'research_context_only',product_ids:exact.map(p => p.id),confirmed_membership:false};
    if (['product','sku','edition'].includes(ref.kind) && exact.length === 1) return {kind:ref.kind,reference_id:ref.id,status:'exact_catalog_product',product_ids:[exact[0].id]};
    if (ref.kind === 'set') return {kind:ref.kind,reference_id:ref.id,status:'set_with_separate_skus',product_ids:data.products.filter(p => p.detail.set_id === ref.id).map(p => p.id),sku_inclusions_transferable:false};
    if (ref.kind === 'family') { const f = data.panini.guide.families.find(f => f.family_id === ref.id); if (f) return {kind:ref.kind,reference_id:ref.id,status:'family_research',family_id:f.family_id,product_ids:[]}; }
    return {kind:ref.kind,reference_id:ref.id,status:ref.kind === 'namespace'?'namespace_not_product':ref.kind === 'configuration'?'configuration_scoped_to_candidate':'research_reference_only',product_ids:[]};
  }
  function candidateBrand(candidate, data) {
    if (candidate.domain === 'pokemon') return 'Pokémon';
    const products = candidate.entity_refs.flatMap(r => resolveEntityRef(r,data).product_ids);
    const brands = [...new Set(data.products.filter(p => products.includes(p.id)).map(p => p.brand))];
    if (brands.length === 1) return brands[0];
    if (candidate.entity_refs.some(r => r.kind === 'family' && data.panini.guide.families.some(f => f.family_id === r.id))) return 'Panini';
    return null;
  }
  function mappedCandidate(candidate, data) {
    return {...copy(candidate),catalog_mapping:{brand:candidateBrand(candidate,data),cards:candidate.card_refs.map(r => resolveCardRef(r,data)),entities:candidate.entity_refs.map(r => resolveEntityRef(r,data)),adds_catalog_entries:false}};
  }
  function queryCatalogRoutes(query, model, data) {
    const card = query.target_card_id ? data.resolveCard(query.target_card_id) : null;
    if (!card) return {result:queryRoutes(query,model),target_resolution:query.target_card_id?{input_id:query.target_card_id,canonical_card_id:null,status:'source_reference_or_uncovered'}:null};
    // Only this adapter supplies existing canonical IDs for composite references.
    // The pure engine and the original candidate source references remain unchanged.
    const adapted = {...model,candidates:model.candidates.map(c => ({...c,card_refs:c.card_refs.map(r => ({...r,id:resolveCardRef(r,data).canonical_card_id || r.id}))}))};
    const result = queryRoutes({...query,target_card_id:card.id},adapted);
    result.query = copy(query);
    result.candidates = result.candidates.map(c => copy(model.candidates.find(original => original.id === c.id)));
    return {result,target_resolution:{input_id:query.target_card_id,canonical_card_id:card.id,status:'exact_existing_identity_adapter',original_source_refs_preserved:true}};
  }
  return {queryRoutes,queryCatalogRoutes,resolveCardRef,resolveEntityRef,candidateBrand,mappedCandidate};
});
