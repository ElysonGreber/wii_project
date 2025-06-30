// zoneamento fixo igual ao Python (parâmetros)
const zoneamentoData = {
    ZR1: { coef: 1.5, taxaOcup: 0.5, taxaPerm: 0.3, alturaMax: 3, recuoMin: "5 m", areaMinLote: "360 m²", testadaMin: "12 m" },
    ZR2: { coef: 1.0, taxaOcup: 0.5, taxaPerm: 0.3, alturaMax: 2, recuoMin: "5 m", areaMinLote: "360 m²", testadaMin: "12 m" },
    ZR3: { coef: 1.0, taxaOcup: 0.5, taxaPerm: 0.3, alturaMax: 2, recuoMin: "5 m", areaMinLote: "360 m²", testadaMin: "12 m" },
    ZR4: { coef: 1.0, taxaOcup: 0.5, taxaPerm: 0.3, alturaMax: 2, recuoMin: "5 m", areaMinLote: "360 m²", testadaMin: "12 m" },
    ZR5: { coef: 1.0, taxaOcup: 0.5, taxaPerm: 0.3, alturaMax: 2, recuoMin: "5 m", areaMinLote: "360 m²", testadaMin: "12 m" },
    ZUM: { coef: 2.0, taxaOcup: 0.7, taxaPerm: 0.2, alturaMax: 6, recuoMin: "5 m", areaMinLote: "300 m²", testadaMin: "12 m" },
    ZC: { coef: 3.0, taxaOcup: 0.8, taxaPerm: 0.15, alturaMax: 8, recuoMin: "5 m", areaMinLote: "300 m²", testadaMin: "12 m" },
    ZPI: { coef: 2.5, taxaOcup: 0.6, taxaPerm: 0.25, alturaMax: 6, recuoMin: "10 m", areaMinLote: "1.000 m²", testadaMin: "20 m" },
    ZOE: { coef: 1.0, taxaOcup: 0.5, taxaPerm: 0.3, alturaMax: 3, recuoMin: "5 m", areaMinLote: "500 m²", testadaMin: "15 m" },
    ZPDS: { coef: 0.5, taxaOcup: 0.2, taxaPerm: 0.5, alturaMax: 2, recuoMin: "10 m", areaMinLote: "2.000 m²", testadaMin: "30 m" }
  };
  
  let map = null;
  let loteLayer = null;
  
  function criarTabela(obj, col1, col2) {
    let html = '<table id="A" class="table table-sm table-bordered">';
    html += "<thead><tr><th>" + col1 + "</th><th>" + col2 + "</th></tr></thead><tbody>";
    for (const key in obj) {
      if (Object.hasOwnProperty.call(obj, key)) {
        html += `<tr><td>${key}</td><td>${obj[key]}</td></tr>`;
      }
    }
    html += "</tbody></table>";
    return html;
  }
  
  async function buscarLote(event) {
    event.preventDefault();
    const indicacaoFiscal = document.getElementById("inputIndicacaoFiscal").value.trim();
    if (!indicacaoFiscal) return;
  
    // Reset mensagens e conteúdo
    document.getElementById("mensagem").innerHTML = "";
    document.getElementById("html_calc").innerHTML = "";
    document.getElementById("html_basico").innerHTML = "";
    document.getElementById("html_lote").innerHTML = "";
    document.getElementById("html_extra").innerHTML = "";
  
    // URLs da API
    const urlLote15 = `https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer/15/query?where=gtm_ind_fiscal='${indicacaoFiscal}'&outFields=*&f=json`;
    const urlLote20 = `https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer/20/query?where=gtm_ind_fiscal='${indicacaoFiscal}'&outFields=*&f=json`;
  
    try {
      // Fetch camada 15 (principal)
      const resp15 = await fetch(urlLote15);
      const data15 = await resp15.json();
  
      if (!data15.features || data15.features.length === 0) {
        document.getElementById("mensagem").innerHTML = `<div class="alert alert-warning">Nenhum lote encontrado para a indicação fiscal "${indicacaoFiscal}".</div>`;
        if (map) map.remove();
        return;
      }
  
      const loteInfo = data15.features[0].attributes;
  
      // Exibir tabela básica (os campos solicitados)
      const basicoObj = {
        "Indicação Fiscal": loteInfo.gtm_ind_fiscal,
        "Inscrição Imobiliária": loteInfo.gtm_insc_imob,
        "Logradouro": loteInfo.gtm_nm_logradouro,
        "Número Predial": loteInfo.gtm_num_predial,
      };
      document.getElementById("html_basico").innerHTML = criarTabela(basicoObj, "Campo", "Valor");
  
      // Calcular potencial construtivo
      const zona = loteInfo.gtm_sigla_zoneamento;
      const areaTerreno = parseFloat(loteInfo.gtm_mtr_area_terreno);
      if (zona && zoneamentoData[zona] && !isNaN(areaTerreno)) {
        const params = zoneamentoData[zona];
        const areaMaxConstruida = areaTerreno * params.coef;
        const areaMaxOcupada = areaTerreno * params.taxaOcup;
        const areaMinPermeavel = areaTerreno * params.taxaPerm;
  
        const calculos = {
          "Zona": zona,
          "Área do Lote (m²)": areaTerreno.toFixed(2).replace(".", ","),
          "Coeficiente de Aproveitamento": params.coef,
          "Taxa de Ocupação": (params.taxaOcup * 100).toFixed(0) + "%",
          "Taxa de Permeabilidade": (params.taxaPerm * 100).toFixed(0) + "%",
          "Altura Máxima (Pavimentos)": params.alturaMax + " pavimentos",
          "Área Máx. Construída (m²)": areaMaxConstruida.toFixed(2).replace(".", ","),
          "Área Máx. Ocupada (m²)": areaMaxOcupada.toFixed(2).replace(".", ","),
          "Área Mín. Permeável (m²)": areaMinPermeavel.toFixed(2).replace(".", ","),
          "Recuo Mínimo": params.recuoMin,
          "Área Mínima do Lote": params.areaMinLote,
          "Testada Mínima": params.testadaMin
        };
        document.getElementById("html_calc").innerHTML = criarTabela(calculos, "Item", "Valor");
      } else {
        document.getElementById("html_calc").innerHTML = `<div class="alert alert-warning">Zona não reconhecida ou área inválida para cálculo.</div>`;
      }
  
      // Dados extras da camada 20 (testadas)
      const resp20 = await fetch(urlLote20);
      const data20 = await resp20.json();
      if (data20.features && data20.features.length > 0) {
        let htmlExtra = "";
        data20.features.forEach((feature, i) => {
          const attrs = feature.attributes;
          htmlExtra += `<h5>Registro ${i + 1}</h5>`;
          htmlExtra += criarTabela(attrs, "Campo", "Valor");
        });
        document.getElementById("html_extra").innerHTML = htmlExtra;
      }
  
      // Mapa Leaflet
      if (map) map.remove();
      map = L.map("map", {
        center: [-25.4284, -49.2733],
        zoom: 16,
        minZoom: 10,
        maxZoom: 23,
        zoomControl: true,
        attributionControl: true,
      });
  
      L.esri.tiledMapLayer({
        url: "https://geocuritiba.ippuc.org.br/server/rest/services/Hosted/Ortofotos2019/MapServer",
        maxZoom: 23,
        attribution: "Ortofotos © GeoCuritiba",
      }).addTo(map);
  
      L.esri.dynamicMapLayer({
        url: "https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer",
        layers: [23],
        opacity: 0.8,
      }).addTo(map);
  
      L.esri.dynamicMapLayer({
        url: "https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer",
        layers: [15],
        opacity: 0.8,
      }).addTo(map);
  
      L.esri.dynamicMapLayer({
        url: "https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer",
        layers: [34],
        opacity: 0.8,
      }).addTo(map);
  
      // Destacar o lote (featureLayer com filtro)
      if (loteLayer) {
        loteLayer.remove();
      }
      loteLayer = L.esri.featureLayer({
        url: "https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer/15",
        where: `gtm_ind_fiscal = '${indicacaoFiscal}'`,
        style: {
          color: "red",
          weight: 3,
          fillOpacity: 0.2,
        },
      }).addTo(map);
  
      loteLayer.on("load", function () {
        loteLayer.query().where(`gtm_ind_fiscal = '${indicacaoFiscal}'`).bounds(function (error, bounds) {
          if (!error && bounds) {
            map.fitBounds(bounds.pad(1), { maxZoom: 19 });
          }
        });
      });
    } catch (err) {
      console.error(err);
      document.getElementById("mensagem").innerHTML = `<div class="alert alert-danger">Erro ao buscar dados. Tente novamente.</div>`;
    }
  }
  
  // Inicializa o mapa vazio
  window.onload = () => {
    map = L.map("map", {
      center: [-25.4284, -49.2733],
      zoom: 16,
      minZoom: 10,
      maxZoom: 23,
      zoomControl: true,
      attributionControl: true,
    });
    L.esri.tiledMapLayer({
      url: "https://geocuritiba.ippuc.org.br/server/rest/services/Hosted/Ortofotos2019/MapServer",
      maxZoom: 23,
      attribution: "Ortofotos © GeoCuritiba",
    }).addTo(map);
    L.esri.dynamicMapLayer({
      url: "https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer",
      layers: [23],
      opacity: 0.8,
    }).addTo(map);
    L.esri.dynamicMapLayer({
      url: "https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer",
      layers: [15],
      opacity: 0.8,
    }).addTo(map);
    L.esri.dynamicMapLayer({
      url: "https://geocuritiba.ippuc.org.br/server/rest/services/GeoCuritiba/Publico_GeoCuritiba_MapaCadastral/MapServer",
      layers: [34],
      opacity: 0.8,
    }).addTo(map);
  };
  