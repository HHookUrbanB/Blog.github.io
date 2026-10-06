(function (root) {
  'use strict';
  const regions = {und: '语言未核实', en: '英文版 · 篮球', 'zh-Hans': '简体中文 · 中国大陆', ja: '日文版 · 日本'};
  const clean = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase().trim();
  const searchForm = value => clean(value).replace(/(^|\s)#(?=[\p{L}\p{N}])/gu, '$1').replace(/\b0*(\d+)\s*\/\s*0*(\d+)\b/g, (_, a, b) => `${Number(a)}/${Number(b)}`);
  const cardTypeLabels = {prospect:'前景卡 · 原类别未注明',unclassified:'原卡种未归类',base:'基础卡 Base',insert:'特卡 Insert',base_variation:'基础变体',image_variation:'照片异图',autograph:'签字 Auto',relic:'纪念物 Relic',autograph_relic:'签字纪念物',redemption:'兑换 Redemption'};
  const cardSearchText = c => searchForm([c.name, c.number, c.subset, c.rarity, c.site_category, c.series_label, c.original.league_scope, ...(c.original.scope_tags||[]), c.original.card_supertype, c.original.card_subtype, c.original.set_code, c.original.official_set_code, cardTypeLabels[c.type], c.original.parallel_name, c.original.serial_max!=null ? '/'+c.original.serial_max : '', ...(c.original.other_players_as_listed || []), ...(c.alias_ids || []), ...(c.language === 'ja' && c.original.base_denominator ? c.original.physical_card_numbers.map(n => `${n}/${c.original.base_denominator}`) : [])].join(' '));
  const safeUrl = value => { try { const u = new URL(value); return u.protocol === 'https:' ? u.href : ''; } catch { return ''; } };
  const unique = values => [...new Set(values.filter(Boolean))];
  const releaseState = value => /^released(?:_|$)/.test(value || '') || value === 'official_sale_documented_exact_global_release_unverified' ? 'released' : /^announced/.test(value || '') ? 'announced' : 'unknown';
  const levelLabels = {season_product:'赛季产品',standalone_edition:'独立清单版',product_family:'线上连续项目',fixed_set_release:'固定套装',product_family_release:'区域产品',distinct_event_edition:'活动独立版',multisport_product_with_nba_exclusive_set:'跨运动盒内 NBA 组件',multisport_event_release_component:'跨运动活动 NBA 组件'};
  const groupOf = p => p.record_level === 'season_product' ? 'regular' : p.record_level === 'standalone_edition' ? 'edition' : p.record_level === 'product_family' ? 'online' : p.record_level === 'fixed_set_release' ? 'fixed' : p.record_level === 'product_family_release' ? 'regional' : 'event';
  const sourceGradeLabels = {official_primary:'官方一手卡单',secondary_specialist:'行业二级卡单'};
  const paniniFamilyAliases = {'panini-donruss-optic':'Optic 光面 Donruss 奥普蒂克','panini-hoops':'NBA Hoops 普通纸卡 霍普斯','panini-mosaic':'Mosaic 马赛克','panini-obsidian':'Obsidian 黑曜石','panini-premium-stock':'Premium Stock Hoops 光面 独立版','panini-prestige':'Prestige 尊贵','panini-prizm':'Prizm 棱镜'};
  const paniniFamilyOf = p => p.brand==='Panini' ? /premium.stock/i.test(p.name_original)?'panini-premium-stock':/donruss.optic/i.test(p.name_original)?'panini-donruss-optic':/prizm/i.test(p.name_original)?'panini-prizm':/hoops/i.test(p.name_original)?'panini-hoops':null : null;
  function filterPaniniFamilies(data,query='') {
    const q=searchForm(query);
    return data.panini.guide.families.filter(f=>!q||q.split(/\s+/).every(token=>searchForm([f.family_id,f.canonical_name,f.original_name,paniniFamilyAliases[f.family_id],f.beginner_explanation_zh,f.look_zh,...f.confusions_zh,...f.known_season_edition_examples.flatMap(e=>[e.original_product_name,e.season,e.subject_scope_zh,...e.verified_notes_zh])].join(' ')).includes(token)));
  }
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function decodePrizmProduct(compact, productId, { includeParallels = true } = {}) {
  const p = compact.products.find((x) => x.metadata.product_id === productId);
  if (!p) return [];
  const m = p.metadata;
  const source = compact.sources.find((s) => s.id === m.source_ids[0]);
  const decode = (r) => {
    const [gi, number, pi, ti, serial, sourceRow] = r;
    const g = m.groups[gi];
    const c = {
      id: `${productId}-${slug(g.subset_name)}-${slug(number)}`,
      product_id: productId,
      season: m.season,
      subset_id: slug(g.subset_name),
      subset_name: g.subset_name,
      card_number: number,
      player_name: p.players[pi],
      team_as_printed: p.teams[ti],
      serial_max: serial,
      canonical_subset_name: g.canonical_subset_name,
      parallel_name: g.parallel_name,
      is_parallel: g.is_parallel,
      is_image_variation: g.is_image_variation,
      card_type: g.card_type,
      autograph: g.autograph,
      memorabilia: g.memorabilia,
      source_ids: m.source_ids,
      source_urls: m.source_urls,
      source_sheet: source.source_sheets[0].name,
      source_row: sourceRow,
      source_grade: m.source_grade,
      verification_status: m.source_grade === 'official_primary' ? 'official_checklist_verified' : 'industry_checklist_verified',
      physical_printed_number_verified: false,
      physical_specimen_confirmed: false,
      ...(p.row_overrides[String(sourceRow)] || {}),
    };
    return c;
  };
  const canonical = p.canonical_rows.map(decode);
  const lookup = new Map();
  const key = (c) => JSON.stringify([c.canonical_subset_name, c.card_number, c.player_name]);
  for (const c of canonical) {
    const k = key(c);
    if (!lookup.has(k)) lookup.set(k, []);
    lookup.get(k).push(c.id);
  }
  const rows = includeParallels ? [...canonical, ...p.explicit_parallel_rows.map(decode)] : canonical;
  for (const c of rows) {
    const matches = lookup.get(key(c)) || [];
    c.canonical_card_id = matches.length === 1 ? matches[0] : null;
    c.underlying_identity_id = `${productId}-identity-${slug(c.canonical_subset_name)}-${slug(c.card_number)}-${slug(c.player_name)}`;
    if (!matches.length) c.canonical_row_status = 'parallel_only_identity_in_source';
  }
  return rows.sort((a, b) => a.source_row - b.source_row);
}

  function decodePackedCards(packed) {
    if(!packed)return [];
    if(packed.encoding!=='column-dictionary-v1')throw new Error('Unsupported checklist encoding');
    return packed.groups.flatMap(g=>{const strings=new Set(g.string_columns),complex=new Set(g.json_columns||[]);return g.rows.map(row=>{const card={...g.defaults};g.columns.forEach((key,i)=>{const value=row[i];if(strings.has(i)){if(value!==-2)card[key]=value===null?null:g.strings[value];}else if(complex.has(i)){if(value!==-2)card[key]=value===null?null:g.json_values[value];}else if(!(value&&typeof value==='object'&&!Array.isArray(value)&&value.$absent===1)){card[key]=value;}});return card;});});
  }
  function normalize(bundle) {
    const full=bundle.full_checklists||{products:[],cards:[],sources:[],parallel_evidence:[]};
    const fullCards=[...(full.cards||[]),...decodePackedCards(full.packed_cards)];
    const prizmFull=bundle.prizm_full_checklists||{products:[],sources:[]};
    const extraCards=[...fullCards,...prizmFull.products.flatMap(p=>decodePrizmProduct(prizmFull,p.metadata.product_id)).map(c=>({...c,source_authority_as_listed:c.source_grade,source_grade:c.source_grade==='industry_checklist'?'secondary_specialist':c.source_grade,explicit_parallel_row:c.is_parallel}))];
    const extraProducts=[...(full.products||[]),...prizmFull.products.map(p=>({...p.metadata,source_authority_as_listed:p.metadata.source_grade,source_grade:p.metadata.source_grade==='industry_checklist'?'secondary_specialist':p.metadata.source_grade}))];
    const productMap = new Map();
    bundle.basketball.products.forEach(p => productMap.set(p.id, p));
    bundle.pokemon_zh_hans.products.forEach(p => productMap.set(p.id, p));
    bundle.pokemon_ja.products.forEach(p => productMap.set(p.product_id, p));
    const panini = bundle.panini_research || {products:[],base_cards:[],sources:[],anchors:[],guide:{families:[]}};
    panini.products.forEach(p=>productMap.set(p.id,p));
    const licensed = bundle.licensed_nba || {products:[],sources:[],base_cards:[]};
    const giannis = bundle.giannis_catalog || {cards:[],base_parallel_evidence:[],coverage_matrix:[],sources:[]};
    const aliases = {...(bundle.giannis_legacy_aliases || {}),...(bundle.pokemon_cn_integration?.legacy_aliases || {}),...Object.fromEntries(extraCards.flatMap(c=>[...(c.legacy_ids||[]).filter(id=>id!==c.id).map(id=>[id,c.id]),...(c.count_as_separate_card_identity===false&&c.canonical_card_id?[[c.id,c.canonical_card_id]]:[])]))};
    for(const key of Object.keys(aliases)){let target=aliases[key];const seen=new Set([key]);while(aliases[target]&&aliases[target]!==target&&!seen.has(target)){seen.add(target);target=aliases[target];}aliases[key]=target;}
    const cn=bundle.pokemon_cn_verified || {card_identities:[],print_variants:[],unviewed_finish_rule_expectations:[],sources:[]};
    const jpPatches=bundle.pokemon_ja_name_completion?.entry_patches || {};
    const sourceById = new Map([...licensed.sources,...giannis.sources,...panini.sources,...cn.sources,...(full.sources||[]),...prizmFull.sources].map(s => [s.id,s]));
    const licensedIds = new Set(licensed.products.map(p=>p.id));
    licensed.products.forEach(p=>productMap.set(p.id,{...(productMap.get(p.id)||{}),...p}));
    const products = bundle.product_index.map(p => {
      const imported=extraProducts.find(x=>x.product_id===p.id);
      const detail = {...(productMap.get(p.id) || {}),...(imported?.product_details||{})};
      const family = p.domain === 'basketball' ? p.name_original.replace(/^\d{4}-\d{2}\s+/, '').replace(/\s+Basketball/, '') : detail.set_code || p.name_original;
      return {...p,coverage:imported?.coverage_scope_zh||p.coverage,checklist_coverage:imported||null,detail, family, family_id: detail.family_id || paniniFamilyOf(p) || family, source_grade:imported?.source_grade || detail.source_grade || null, panini_anchor:panini.products.some(x=>x.id===p.id), licensed_nba: licensedIds.has(p.id), record_level: detail.record_level || p.record_level || 'legacy_product', entity_group: licensedIds.has(p.id) || panini.products.some(x=>x.id===p.id) ? groupOf(detail) : 'legacy', release_state: releaseState(p.status_as_of), region: p.market === 'China' ? '中国区域发行 · 语言未核实' : regions[p.language], region_key: p.market === 'China' ? 'China' : 'other_or_unspecified', series: p.season_or_era || '未标注',
        summary: detail.description_zh || detail.summary_zh || detail.theme_zh || p.coverage,
        source_urls: unique([...(p.source_urls || []),...(imported?.source_urls||[]), ...(detail.sources || []).map(s => s.url)]).filter(safeUrl)};
    });
    const legacyCards = [...new Map([...bundle.basketball.base_cards, ...bundle.basketball.giannis_cards, ...licensed.base_cards, ...panini.base_cards,...extraCards.filter(c=>(c.language||'en')==='en'&&c.count_as_separate_card_identity!==false)].map(c => [c.id, c])).values()].filter(c => !aliases[c.id]);
    const basketball = [...new Map([...legacyCards,...giannis.cards.filter(c => c.count_as_separate_card_identity !== false && !aliases[c.id]).map(c=>({...c,...extraCards.find(x=>x.id===c.id)}))].map(c=>[c.id,c])).values()].map(c => ({
      id: c.id, alias_ids: Object.keys(aliases).filter(id=>aliases[id]===c.id), product_ids: [c.product_id], set_id: c.product_id, name: c.player_name,
      number: c.card_number, subset: c.subset_name, type: c.ui_card_type || c.card_type || 'unclassified', rarity: null,
      language: 'en', source_grade:c.source_grade || 'official_primary', record_kind:c.source_grade==='secondary_specialist'?'行业二级逐卡清单':'官方逐卡清单', proof_level:c.source_grade==='secondary_specialist'?'player_listed_secondary_checklist':'player_listed_official_checklist', original: c, image_url: null, sources: c.source_urls || [],
      note: (c.team_as_printed ? `卡表球队：${c.team_as_printed}。` : '') + (c.explicit_parallel_row?'该球员与平行版本由来源逐行列出；':'') + (c.source_grade==='secondary_specialist'?'行业二级卡单位置，非官方最终清单；':'官方逐卡身份；') + (c.explicit_parallel_row?'卡单列出不等于已经核验实物生产或实卡照片。':'不是实卡照片、未列出的平行版本或私人持有证明。') + (c.identity_warning_zh || ''),
    }));
    const chinese = (cn.card_identities.length?cn.card_identities:bundle.pokemon_zh_hans.representative_cards).map(c => {
      const verified=!!c.verification?.identity_metadata;
      const membership=c.availability_scope==='confirmed_booster'?[c.set_id]:c.availability_scope==='confirmed_hope_booster'?['pokemon-cn-151-wang']:verified?[]:[c.set_id];
      const context=verified?[c.research_product_id || c.set_id]:[c.set_id];
      const seriesLabel=c.set_id==='pokemon-cn-151-shared'?'收集啦151 · 共享编号身份':'太晶盛聚 · 官方展示卡';
      const scopeLabel=cnAvailabilityText(c.availability_scope);
      return {id:c.id,alias_ids:Object.keys(aliases).filter(id=>aliases[id]===c.id),product_ids:membership,research_context_ids:context,set_id:c.set_id,name:c.name,number:c.card_number,
        subset:c.official_set_code || '',type:'verified_card_image',rarity:c.rarity_symbol,language:'zh-Hans',record_kind:verified?'官方卡图逐张核验':'代表卡图核验',proof_level:verified?'official_card_image_visually_verified':null,original:c,image_url:c.verification?.source_image_url || null,
        series_label:seriesLabel,availability_label:scopeLabel,verified_prints:cn.print_variants.filter(v=>v.card_identity_id===c.id),unviewed_expectations:cn.unviewed_finish_rule_expectations.filter(v=>v.card_identity_id===c.id),
        sources:verified?unique([...(c.sources||[]).map(id=>sourceById.get(id)?.url),c.verification.source_page_url]):(c.sources||[]).map(x=>x.url),
        note:verified?scopeLabel+'。已核验卡名、编号、稀有度与官方设计卡图；不是实物认证或完整产品卡表。':'代表卡记录；不构成完整卡表。'};
    });
    const japanese = bundle.pokemon_ja_public_checklists.checklists.flatMap(set => set.entries.map(original => {
      const c={...original,...(jpPatches[original.entry_id] || {})};
      return {
      id: c.entry_id, product_ids: products.filter(p => p.detail.set_id === c.set_id).map(p => p.id), set_id: c.set_id,
      name: c.name_original || null,
      number: c.physical_card_numbers.length ? c.physical_card_numbers.join(' / ') : c.display_number_raw,
      subset: set.set_id.replace('pokemon-jp-', '').toUpperCase(), type: 'public_preview',
      rarity: c.category_is_printed_rarity ? c.rarity : null, site_category: c.official_site_category,
      language: 'ja', record_kind: '官网展示行', original: c, image_url: c.image_url,
      sources: c.source_urls || [], note: c.physical_card_numbers.length > 1 ? '此展示行对应 151、152 两张实物卡，不能按一张计数。' : (!c.category_is_printed_rarity ? `官网分组 ${c.official_site_category} 不作为卡面稀有度。` : (!c.name_original ? '名称未核实，保留空值；可查官方卡图。' : '官网公开预览，非完整秘密卡／加工版清单。')),
    }}));
    const extraChinese=extraCards.filter(c=>c.language==='zh-Hans').map(c=>({id:c.id,alias_ids:[],product_ids:[c.product_id],set_id:c.product_id,name:c.name||c.player_name,number:c.card_number,subset:c.subset_name||c.official_set_code||'',type:c.card_type||'checklist_card',rarity:c.rarity_symbol||null,language:'zh-Hans',source_grade:c.source_grade||'secondary_specialist',record_kind:c.source_grade==='official_primary'?'官方逐卡清单':'行业公开逐卡清单',original:c,image_url:null,sources:c.source_urls||[],listed_prints:(full.print_variants||[]).filter(v=>v.card_id===c.id),verified_prints:[],unviewed_expectations:[],availability_label:c.availability_label||'此套编号身份；具体工艺按所列来源',note:c.scope_note_zh||'具名逐卡清单；未逐张核验官方卡图、实物或全部工艺。'}));
    const cards = [...basketball, ...chinese, ...japanese,...extraChinese];
    for (const p of products) {
      p.cards = cards.filter(c => c.product_ids.includes(p.id));
      p.related_cards = cards.filter(c => (c.research_context_ids||[]).includes(p.id) && !c.product_ids.includes(p.id));
      p.search_text = searchForm([p.name_original, p.id, p.family, p.summary, p.detail.set_code, p.detail.set_id, p.family_id, paniniFamilyAliases[p.family_id], levelLabels[p.record_level], p.detail.distribution, ...(p.detail.aliases || []), ...(p.detail.configurations || []).map(x=>x.name), ...[...p.cards,...p.related_cards].map(cardSearchText)].join(' '));
      if (p.cards.some(c => c.name === 'Giannis Antetokounmpo')) p.search_text += ' 字母哥 giannis';
    }
    const cardById = new Map(cards.map(c=>[c.id,c]));
    const resolveCard = id => cardById.get(aliases[id] || id) || cardById.get(giannis.cards.find(c=>c.id===id)?.canonical_card_id);
    const completeCoverage=full.products.filter(p=>p.source_pages_total!=null);
    const giannisView={...giannis,counts:{...giannis.counts,...(completeCoverage.length===20?{official_checklist_pages_read:completeCoverage.reduce((n,p)=>n+p.source_pages_read,0)}:{})},cards:giannis.cards.map(c=>({...c,id:c.count_as_separate_card_identity===false?c.id:aliases[c.id]||c.id,canonical_card_id:aliases[c.canonical_card_id]||c.canonical_card_id})),base_parallel_evidence:giannis.base_parallel_evidence.map(r=>({...r,related_base_card_ids:r.related_base_card_ids.map(id=>aliases[id]||id)}))};
    return {products, cards, full_cards:fullCards, matrix: bundle.basketball.base_parallel_matrix, bundle, licensed, sourceById, panini, giannis:giannisView, cn, aliases, resolveCard};
  }
  function matchProduct(p, filters = {}) {
    return (!filters.scope || filters.scope === 'all' || p.section === filters.scope || (filters.scope === 'basketball' && p.domain === 'basketball')) &&
      (!filters.family || p.family_id === filters.family) && (!filters.source_grade || p.source_grade === filters.source_grade) && (!filters.brand || p.brand === filters.brand) && (!filters.language || p.language === filters.language) &&
      (!filters.series || p.series === filters.series) && (!filters.product || p.id === filters.product) &&
      (!filters.status || p.release_state === filters.status) && (!filters.region || p.region_key === filters.region) && (!filters.entity_group || p.entity_group === filters.entity_group) && (!filters.licensed || p.licensed_nba);
  }
  function filterProducts(data, filters = {}) {
    const query = searchForm(filters.query);
    return data.products.filter(p => matchProduct(p, filters) && (!query || query.split(/\s+/).every(q => p.search_text.includes(q))));
  }
  function filterCards(data, filters = {}) {
    const ids = new Set(data.products.filter(p => matchProduct(p, filters)).map(p => p.id));
    const query = searchForm(filters.query).replace(/字母哥|扬尼斯[·・]?阿德托昆博/g, 'giannis');
    return data.cards.filter(c => (filters.product ? c.product_ids.some(id => ids.has(id)) : [...c.product_ids,...(c.research_context_ids||[])].some(id => ids.has(id))) && (!filters.rarity || c.rarity===filters.rarity) && matchCardType(c,filters.card_type) && (!query || query.split(/\s+/).every(q => searchForm([cardSearchText(c), ...[...c.product_ids,...(c.research_context_ids||[])].map(id => data.products.find(p => p.id === id)?.name_original)].join(' ')).includes(q))));
  }
  function filterProductChecklist(product, filters={}) {
    const q=searchForm(filters.query).replace(/字母哥|扬尼斯[·・]?阿德托昆博/g,'giannis');
    return product.cards.filter(c=>(!filters.league_scope||c.original.league_scope===filters.league_scope)&&(!filters.rarity||c.rarity===filters.rarity)&&(!filters.subset||c.subset===filters.subset)&&(!filters.parallel||c.original.parallel_name===filters.parallel)&&matchCardType(c,filters.card_type)&&(!filters.numbering||(filters.numbering==='known'?c.original.serial_max!=null:filters.numbering==='unnumbered'?c.original.serial_numbered===false:c.original.serial_max==null&&c.original.serial_numbered!==false))&&(!q||q.split(/\s+/).every(t=>cardSearchText(c).includes(t))));
  }
  function productParallelEvidence(data,productId) {
    const complete=(data.bundle.full_checklists?.parallel_evidence||[]).filter(r=>r.product_id===productId);
    return complete.length?complete:data.giannis.base_parallel_evidence.filter(r=>r.product_id===productId);
  }
  function cnAvailabilityText(scope) {
    return ({shared_series_base_gallery:'共享151画廊；望补充包的具体工艺收录未逐一核实',confirmed_booster:'太晶盛聚补充包 · 已确认关联',confirmed_hope_booster:'望补充包 · 已确认关联',confirmed_hope_coin_set:'望硬币套装 · 已确认关联；补充包未核实',confirmed_hope_coin_set_booster_unverified:'望硬币套装 · 已确认关联；补充包未核实'}[scope] || '发行关联未核实');
  }
  function filterChinese(data, filters={}) {
    const query=searchForm(filters.query);
    return data.cards.filter(c=>c.language==='zh-Hans' && (!filters.rarity || c.rarity===filters.rarity) && (!filters.group || (filters.group==='gengu'?c.set_id==='pokemon-cn-gengu':filters.group==='taijing'?c.set_id==='pokemon-cn-taijing':filters.group==='151-gallery'?c.original.gallery_scope==='ordinary_numbered_001_to_151':c.original.gallery_scope==='additional_officially_featured')) && (!query || query.split(/\s+/).every(q=>cardSearchText(c).includes(q))));
  }
  function matchCardType(c, type) {
    if (!type || type === 'all') return true;
    const r=c.original || c;
    if (type==='autograph') return r.autograph === true;
    if (type==='relic') return r.memorabilia === true;
    if (type==='variation') return ['base_variation','image_variation'].includes(c.type || r.card_type);
    if (type==='image') return r.variation_kind==='image' || c.type==='image_variation';
    if (type==='multi') return r.multi_player === true;
    if (type==='dual') return r.multi_player === true && r.subjects?.length===2;
    if (type==='triple') return r.multi_player === true && r.subjects?.length===3;
    if (type==='nameplate') return /NAMEPLATE/i.test(r.card_set || r.subset_name || '');
    return (c.type || r.card_type)===type;
  }
  function filterGiannis(data, filters={}) {
    const ids=new Set(data.giannis.cards.filter(c=>c.count_as_separate_card_identity!==false).map(c=>c.id));
    return filterCards(data,{...filters,query:filters.query || ''}).filter(c=>ids.has(c.id));
  }
  function filterParallelEvidence(data, filters={}) {
    const q=searchForm(filters.query);
    return data.giannis.base_parallel_evidence.filter(r=>(!filters.product||r.product_id===filters.product)&&(!filters.base_id||r.related_base_card_ids.includes(filters.base_id))&&(!q||searchForm(r.official_odds_label).includes(q))&&(!filters.configuration||Object.hasOwn(r.odds_by_configuration || {},filters.configuration))&&(!filters.numbering||(filters.numbering==='known'?r.serial_max!=null:filters.numbering==='unnumbered'?r.serial_status==='officially_unnumbered':r.serial_max==null&&r.serial_status!=='officially_unnumbered')));
  }
  const numberedText = row => row.serial_numbered === true ? (row.numbering_notation || `/${row.serial_max}`) : row.serial_numbered === false ? '无编 · 非总印量' : '编号未说明';
  const csv = rows => '\uFEFF' + rows.map(row => row.map(value => { let v = String(value ?? ''); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"'; }).join(',')).join('\r\n');
  const api = {decodePackedCards,decodePrizmProduct,filterProductChecklist,productParallelEvidence,cnAvailabilityText,filterChinese,sourceGradeLabels,paniniFamilyAliases,paniniFamilyOf,filterPaniniFamilies,cardTypeLabels, matchCardType, filterGiannis, filterParallelEvidence, releaseState, levelLabels, groupOf, normalize, filterProducts, filterCards, matchProduct, clean, searchForm, cardSearchText, safeUrl, unique, regions, numberedText, csv};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CatalogCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
