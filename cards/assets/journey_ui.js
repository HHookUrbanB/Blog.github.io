/* Compact optional route page. All input remains in memory; budget is never written to a URL. */
(function () {
  'use strict';
  window.CatalogJourneyUI = {create({model,data,esc,icon,footer,download,openRoute}) {
    const J = window.CatalogJourneys, $ = id => document.getElementById(id);
    const defaults = () => ({goal:'character',domain:'basketball',language:'any',subject:'',styles:[],result_limit:20});
    const state = {query:defaults(),brand:'',budgetAmount:'',budgetCurrency:'CNY',budgetInvalid:false,error:'',returnHash:'#catalog',lastHash:'#journeys'};
    const labels = {photo:'球员照片 / 图鉴样本',paper:'纸质',chrome:'镀铬 / 光面',texture:'几何 / 纹理',dark:'深色',illustration:'插画',kanto:'关都',eevee_theme:'伊布主题',anniversary:'周年',mega:'超级进化',unova:'合众'};
    const styles = [...new Set(model.candidates.flatMap(c => c.style_tags))];
    const languages = {'any':'不限定语言','en':'英文 · 篮球','zh-Hans':'简中 · 中国大陆','ja':'日文 · 日本'};
    const authorities = {official_primary:'官方一手来源',secondary_specialist:'行业二级来源',official_checklist:'官方卡单',official_education_sheet:'官方包装说明',official_product:'官方产品页','official Japanese Pokemon Card Game':'宝可梦卡牌官方（日文）','宝可梦中国':'宝可梦中国官方'};
    const safeUrl = url => { try { return new URL(url).protocol === 'https:' ? url : null; } catch { return null; } };
    const sourceLinks = ids => `<ul class="journey-sources">${[...new Set(ids || [])].map(id => model.sources.find(s => s.id === id)).filter(s => s && safeUrl(s.url)).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(authorities[s.authority] || '来源层级未标注')} · ${esc(s.title)} ↗</a></li>`).join('')}</ul>`;
    function readRoute(paramString) {
      const p = new URLSearchParams(paramString || '');
      state.query = defaults(); state.error = '';
      for (const key of ['goal','domain','language']) if (p.has(key)) {
        if (model.input_contract[key].includes(p.get(key))) state.query[key] = p.get(key);
        else state.error = '链接含不支持的路线选项，已使用默认值。';
      }
      for (const key of ['subject','target_card_id','requested_finish']) if (p.get(key)) state.query[key] = p.get(key).slice(0,160);
      state.query.styles = p.getAll('style').slice(0,styles.length);
      state.brand = ['','Topps','Panini','Pokémon'].includes(p.get('brand') || '') ? p.get('brand') || '' : '';
      state.lastHash='#journeys'+(paramString?'?'+paramString:'');
    }
    function saveRoute(push = false) {
      const p = new URLSearchParams();
      for (const key of ['goal','domain','language','subject','target_card_id','requested_finish']) if (state.query[key]) p.set(key,state.query[key]);
      state.query.styles.forEach(s => p.append('style',s));
      if (state.brand) p.set('brand',state.brand);
      const hash = '#journeys?' + p.toString();state.lastHash=hash;
      if (push && history.pushState) history.pushState(null,'',hash); else history.replaceState(null,'',hash);
    }
    function output() {
      const q = {...state.query,styles:[...state.query.styles]};
      if(state.budgetInvalid)throw new Error('预算输入尚未完成或格式不正确；请填 0 或正数，或清空后再导出。');
      if (state.budgetAmount !== '') {
        const amount = Number(state.budgetAmount);
        if (!Number.isFinite(amount) || amount < 0 || !/^(\d+(\.\d*)?|\.\d+)$/.test(state.budgetAmount)) throw new Error('预算上限请填 0 或正数；留空也可以。');
        q.budget_ceiling = {amount,currency:state.budgetCurrency};
      }
      const {result,target_resolution} = J.queryCatalogRoutes(q,model,data);
      const visible = result.candidates.map(c => J.mappedCandidate(c,data)).filter(c => !state.brand || c.catalog_mapping.brand === state.brand);
      return {schema_version:'1.0-catalog-beginner-journey',as_of:model.as_of,engine_output:result,target_resolution,ui_filters:{brand:state.brand || null},
        visible_candidate_count:visible.length,visible_candidates:visible,brand_filter_applied_after_rule_matching:true,
        budget_used_as_price_filter:false,adds_catalog_entries:false,scope_note_zh:'仅此公共快照中的偏好候选。品牌为目录身份附加筛选；无实时价格、库存或投资推断。'};
    }
    function cardRef(ref) {
      const map = J.resolveCardRef(ref,data), c = map.canonical_card_id ? data.resolveCard(map.canonical_card_id) : null;
      const visual = c ? (window.CATALOG_VISUALS || []).find(v=>v.card_id===c.id && v.data_url) : null;
      const title = [ref.subject,ref.card_set,ref.card_number || '卡号未核实',ref.rarity].filter(Boolean).join(' · ');
      const evidence = !c ? '代表卡研究来源 · 身份尚未对齐' : c.language === 'en' ? (c.source_grade === 'secondary_specialist' ? '精确来源 · 行业二级卡单位置' : '精确来源 · 官方具名卡单') : c.language === 'zh-Hans' ? '精确来源 · 官方卡图核验' : '精确来源 · 官方展示卡表';
      const availability = ref.availability_scope === 'confirmed_hope_coin_set_booster_unverified' ? '只确认硬币套装关联；望补充包收录未核实，亦未断言套装独占。' : ref.availability_scope === 'shared_series_base_gallery' ? '151 共享普通画廊；该工艺在望补充包的收录尚未逐一核实。' : ref.availability_scope === 'confirmed_hope_booster' ? '此编号已确认望补充包关联；不能外推其他编号或工艺。' : '';
      return `<li class="journey-ref"><span class="badge ${c?.source_grade === 'secondary_specialist'?'secondary':''}">${esc(evidence)}</span><div>${c?`<button class="text-btn" data-card="${esc(c.id)}">${esc(title)} →</button>`:`<strong>${esc(title)}</strong>`}</div>${visual?`<figure class="journey-thumb"><img src="${esc(visual.data_url)}" alt="${esc(visual.alt_zh)}"><figcaption>${esc(visual.credit_zh)} · 仅此精确身份图例</figcaption></figure>`:''}${c?.image_url && safeUrl(c.image_url)?`<p><a href="${esc(c.image_url)}" target="_blank" rel="noopener noreferrer">打开此卡官方原图 ↗</a></p>`:''}${!c?`<p>${esc(map.reason_zh)}</p>`:''}${availability?`<p>${esc(availability)}</p>`:''}<p class="count-info">${c?.language === 'en'?'清单身份不等于实物、已兑现签字或全平行版本证据。':c?'只确认所列身份与来源；稀有度不自动证明工艺、价格或抽率。':''}</p>${sourceLinks(ref.source_ids)}</li>`;
    }
    function entityLinks(candidate) {
      const exactSku = candidate.entity_refs.some(r => r.kind === 'sku');
      return candidate.entity_refs.map(ref => {
        const m = J.resolveEntityRef(ref,data);
        if (m.status === 'exact_catalog_product') return m.product_ids.map(id => `<button class="btn" data-product="${esc(id)}">查看${ref.kind === 'sku'?'此规格':'发行'}：${esc(data.products.find(p => p.id === id).name_original)}${id.endsWith('-deluxe')?' · Deluxe':''} →</button>`).join('');
        if (m.status === 'family_research') return `<button class="btn" data-family="${esc(m.family_id)}">查看名称家族与历史发行 →</button>`;
        if (m.status === 'set_with_separate_skus') return exactSku ? `<span class="count-info">系列命名空间 ${esc(ref.id)}；本候选只使用上方准确 SKU。</span>` : `<div class="journey-context"><span>系列商品入口（每种包装另核）：</span>${m.product_ids.map(id => `<button class="text-btn" data-product="${esc(id)}">${esc(data.products.find(p => p.id === id).name_original)}${id.endsWith('-deluxe')?' · Deluxe':''} →</button>`).join('')}</div>`;
        if (m.status === 'research_context_only') return `<span class="count-info">研究上下文 ${esc(ref.id)}；商品收录以每张卡的证据为准。</span>`;
        if (m.status === 'namespace_not_product') return `<span class="count-info">共享编号空间 ${esc(ref.id)}；不计作补充包。</span>`;
        if (m.status === 'configuration_scoped_to_candidate') return '';
        return `<span class="count-info">历史发行研究：${esc(ref.id)}。尚无此发行的独立逐卡入口，请查看下方来源。</span>`;
      }).join('');
    }
    function candidateCard(candidate) {
      const o = candidate.opening;
      return `<article class="journey-card" data-journey-candidate="${esc(candidate.id)}"><div class="journey-card-kicker">${esc(languages[candidate.language])} · ${esc(J.candidateBrand(candidate,data) || '品牌未核实')}</div><h3>${esc(candidate.title_zh)}</h3><p class="journey-match"><b>为什么适合这个方向：</b>${esc(candidate.fit_reason_zh)}</p>${candidate.card_refs.length?`<ul class="journey-refs">${candidate.card_refs.map(cardRef).join('')}</ul>`:''}${o?`<div class="journey-opening"><strong>仅此包装：${esc(o.configuration)}</strong><p>${o.cards_per_pack == null?'每包张数未核实':esc(o.cards_per_pack)+' 张/包'} · ${o.packs_per_box == null?'每盒包数未核实':esc(o.packs_per_box)+' 包/盒'}</p>${o.official_inclusions.length?`<p>官方内容说明：${o.official_inclusions.map(x => `${esc(({foil:'闪卡',pikachu_card:'皮卡丘卡',basic_energy:'基本能量',AR:'AR'})[x.kind] || x.kind)} ${esc(x.count_options?x.count_options.join(' 或 '):x.count)} 张`).join('；')}。</p>`:''}<p>不保证指定卡号。当前库存与含运费总价未核查。</p></div>`:''}<div class="journey-links">${entityLinks(candidate)}</div><div class="journey-coverage"><b>已知覆盖：</b>${esc(candidate.coverage.scope_zh)}<br>${esc(candidate.coverage.display_note_zh)}</div>${candidate.cautions_zh.length?`<ul class="rule-list">${candidate.cautions_zh.map(t => `<li>${esc(t)}</li>`).join('')}</ul>`:''}<details><summary>本候选的全部来源与核查日期</summary><p>资料快照：${esc(model.as_of)}。来源事实与“为什么适合”编辑判断分别标注。</p>${sourceLinks(candidate.source_ids)}</details></article>`;
    }
    function renderResults() {
      let result;
      try { result = output(); } catch (e) { $('journey-results').innerHTML = `<div class="notice" role="alert">${esc(e.message)}</div>`; return; }
      const e = result.engine_output, cards = result.visible_candidates;
      $('journey-results').innerHTML = `${state.error?`<p class="notice" role="alert">${esc(state.error)}</p>`:''}<div class="section-head"><div><h2>先看这 ${cards.length} 个方向</h2><p>本路线已覆盖 ${e.candidate_count_in_current_coverage} 个匹配；${state.brand?'再按品牌筛选。':'按编辑对照顺序展示。'}不是价格、热度或抽率排名。</p></div><button class="btn" data-journey-action="export">${icon('download',14)}导出当前路线 JSON</button></div>${e.warnings_zh.map(t => `<p class="notice">${esc(t)}</p>`).join('')}${!cards.length?'<div class="notice">这组偏好暂未覆盖；不代表不存在对应卡或商品。可减少筛选，或回目录搜索。</div>':''}${e.budget_ceiling?`<p class="journey-budget-note">你设定的上限：${esc(e.budget_ceiling.amount)} ${esc(e.budget_ceiling.currency)}。仅作停止点提示，候选没有按价格过滤；是否在预算内尚未判断。</p>`:''}<div class="journey-result-grid">${cards.map(candidateCard).join('')}</div><p class="count-info">${esc(e.coverage_note_zh)}</p>`;
    }
    function render() {
      const q = state.query, selected = (a,b) => a === b ? ' selected' : '';
      $('main').innerHTML = `<section class="journey-header"><div><div class="eyebrow">OPTIONAL / START SMALL</div><h1>新手路线</h1><p>先选喜欢的方向，马上看有出处的卡或包装。随时回目录继续搜索。</p></div><div class="journey-links"><button class="btn" data-journey-action="back">返回原来的页面</button><button class="text-btn" data-journey-action="cancel">取消并清空</button></div></section><nav class="journey-goals" aria-label="选择收藏目标">${model.routes.map(r => `<button class="btn" id="journey-goal-${r.id}" data-journey-goal="${r.id}" aria-pressed="${q.goal === r.id}">${esc(r.label_zh)}</button>`).join('')}</nav><section class="journey-controls" aria-label="可选偏好筛选"><label>领域<select data-journey-field="domain">${[['basketball','篮球 · 球员'],['pokemon','宝可梦 · 角色']].map(([v,t])=>`<option value="${v}"${selected(q.domain,v)}>${t}</option>`).join('')}</select></label><label>语言 / 市场<select data-journey-field="language">${Object.entries(languages).map(([v,t])=>`<option value="${v}"${selected(q.language,v)}>${t}</option>`).join('')}</select></label><label>品牌<select data-journey-field="brand">${[['','不限定'],['Topps','Topps'],['Panini','Panini'],['Pokémon','Pokémon']].map(([v,t])=>`<option value="${v}"${selected(state.brand,v)}>${t}</option>`).join('')}</select></label><label>喜欢的球员 / 角色<input id="journey-subject" type="search" maxlength="160" list="journey-subjects" value="${esc(q.subject)}" placeholder="如字母哥、皮卡丘、月亮伊布"><datalist id="journey-subjects">${Object.keys(model.subject_aliases).filter(k=>!/^[A-Za-z]/.test(k)).map(k=>`<option value="${esc(k)}"></option>`).join('')}</datalist></label><div class="journey-style-options" role="group" aria-label="风格偏好，可多选">${styles.map(s=>`<button class="journey-chip" id="journey-style-${esc(s)}" data-journey-style="${esc(s)}" aria-pressed="${q.styles.includes(s)}">${esc(labels[s] || s)}</button>`).join('')}</div><p class="count-info journey-full">可全部留空。风格是编辑标签；多选要求同时匹配，不从画风推导稀有度。</p><details class="journey-full"><summary>可选：工艺要求、精确目标与娱乐预算上限</summary><div class="journey-advanced"><label>希望核查的工艺<input id="journey-finish" maxlength="160" value="${esc(q.requested_finish || '')}" placeholder="如大师球纹样、Gold Refractor"></label><label>已有精确目标 ID<input id="journey-target" maxlength="160" value="${esc(q.target_card_id || '')}" placeholder="可从单卡资料取得，留空也可以"></label><label>预算上限（不作价格筛选）<input id="journey-budget" type="number" min="0" step="any" inputmode="decimal" value="${esc(state.budgetAmount)}" placeholder="可留空"></label><label>币种<select data-journey-field="currency">${['CNY','JPY','USD','EUR','GBP','HKD'].map(v=>`<option value="${v}"${selected(state.budgetCurrency,v)}>${v}</option>`).join('')}</select></label></div><p class="count-info">预算只留在本次页面内存中，不写入链接或浏览器存储。点击导出会把本次输入与来源一起保存到你下载的文件。</p></details><div class="journey-full"><button class="text-btn" data-journey-action="reset">重置所有路线偏好</button></div></section><section id="journey-results" aria-live="polite"></section><details class="journey-reference"><summary>接下来怎么做，以及最容易混淆的版本</summary><ol class="rule-list">${model.routes.find(r=>r.id===q.goal).steps_zh.map(t=>`<li>${esc(t)}</li>`).join('')}</ol>${model.boundary_examples.map(b=>`<h3>${esc(b.title_zh)}</h3><p>${esc(b.takeaway_zh)}</p>${sourceLinks(b.source_ids)}`).join('')}<div class="journey-dimensions">${model.comparison_dimensions.map(d=>`<p><b>${esc(d.label_zh)}</b>：${esc(d.ask_zh)}</p>`).join('')}</div></details><details class="journey-reference"><summary>再看三组代表目标（不会加入当前匹配计数）</summary>${model.representative_targets.map(g=>`<h3>${esc(g.title_zh)}</h3><p>${esc(g.selection_reason_zh)}</p><ul class="journey-refs">${g.cards.map(cardRef).join('')}</ul><p class="count-info">${esc(g.coverage.scope_zh)} ${esc(g.coverage.display_note_zh)}</p>`).join('')}</details>${footer()}`;
      for (const [id,key] of [['journey-subject','subject'],['journey-finish','requested_finish'],['journey-target','target_card_id']]) $(id).addEventListener('input',e => {state.query[key] = e.target.value.slice(0,160);state.error='';saveRoute();renderResults();});
      $('journey-budget').addEventListener('input',e => {state.budgetAmount=e.target.value;state.budgetInvalid=!!e.target.validity?.badInput;renderResults();});
      renderResults();
    }
    function action(dataset) {
      if (dataset.journeyGoal) { if (!model.input_contract.goal.includes(dataset.journeyGoal)) return true; state.query.goal=dataset.journeyGoal;state.error='';saveRoute(true);render();$('journey-goal-'+dataset.journeyGoal).focus({preventScroll:true});return true; }
      if (dataset.journeyStyle) { const s=dataset.journeyStyle;if (!styles.includes(s)) return true;state.query.styles=state.query.styles.includes(s)?state.query.styles.filter(x=>x!==s):[...state.query.styles,s];saveRoute();render();$('journey-style-'+s).focus({preventScroll:true});return true; }
      const a = dataset.journeyAction;
      if (!a) return false;
      if (a === 'export') { try { download(output()); } catch(e) {$('journey-results').innerHTML=`<div class="notice" role="alert">${esc(e.message)}</div>`;} }
      if (a === 'back' || a === 'cancel') {const target=state.returnHash;if(a==='cancel'){state.query=defaults();state.brand='';state.budgetAmount='';state.budgetCurrency='CNY';state.budgetInvalid=false;state.lastHash='#journeys';state.error='';}openRoute(target);}
      if (a === 'reset') {state.query=defaults();state.brand='';state.budgetAmount='';state.budgetCurrency='CNY';state.budgetInvalid=false;state.lastHash='#journeys';state.error='';saveRoute();render();}
      return true;
    }
    function change(target) {
      const key=target.dataset.journeyField;if(!key)return false;
      const v=target.value;
      if (key==='brand' && ['','Topps','Panini','Pokémon'].includes(v)) state.brand=v;
      else if (key==='currency' && ['CNY','JPY','USD','EUR','GBP','HKD'].includes(v)) state.budgetCurrency=v;
      else if (['domain','language'].includes(key) && model.input_contract[key].includes(v)) state.query[key]=v;
      state.error='';saveRoute();renderResults();return true;
    }
    return {state,render,renderResults,readRoute,saveRoute,output,action,change,cardRef,candidateCard,sourceLinks};
  }};
})();
