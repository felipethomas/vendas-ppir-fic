var READY_STATE_NAO_INICIALIZADO = 0;
var READY_STATE_CARREGANDO = 1;
var READY_STATE_CARREGADO = 2;
var READY_STATE_INTERATIVO = 3;
var READY_STATE_COMPLETO = 4;

var req = null;
var str;

//O tipo de Node é um valor numérico e vai de 1 a 12.
var TiposNode = new Array("ELEMENT", "ATTRIBUTE", "TEXT", "CDATA_SECTION", "ENTITY_REFERENCE",
                "ENTITY", "PROCESSING_INSTRUCTION", "COMMENT", "DOCUMENT", "DOCUMENT_TYPE",
                "DOCUMENT_FRAGMENT", "NOTATION");

function criarXMLHTTPRequest() {
    var xRequest = null;

    if (window.XMLHttpRequest) {
        // Mozilla 1.0+, Netscape 8.0+, Firefox 1.0+,
        // Safari 1.2+, Internet Explorer 7.0+
        xRequest = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // Internet Explorer 5.0, 5.5, 6.0
        var progIDs = ["MSXML2.XMLHTTP.6.0",
			"MSXML2.XMLHTTP.4.0",
			"MSXML2.XMLHTTP.3.0",
			"MSXML2.XMLHTTP",
			"Microsoft.XMLHTTP"];
        for (var i = 0; xRequest == null && i < progIDs.length; i++) {
            xRequest = new ActiveXObject(progIDs[i]);
        }
    }

    return xRequest;
}

function enviarRequisicaoHTTP(url, parametros, metodoHTTP, metodoCallback) {
    if (!metodoHTTP) {
        metodoHTTP = "GET";
    }

    req = criarXMLHTTPRequest();

    if (req) {
        req.onreadystatechange = metodoCallback;
        req.open(metodoHTTP, url, true);
        req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        req.send(parametros);
    } else {
        var mensagem = document.getElementById('mensagens');
        mensagem.appendChild(this.montaMensagem('Erro', 'Objeto XMLHttpRequest não suportado pelo browser.', 'alert-error'));
    }
}

//Codigos referentes ao select de vendedores

window.onload = function () {
    enviarRequisicaoHTTP("RetornaDadosVendedores.aspx", null, "POST", processaRespostaVendedor);
}

function processaRespostaVendedor() {
    if (req.readyState == READY_STATE_COMPLETO) {
        preparaSelectVendedores();
    }
}

function preparaSelectVendedores() {
    try {
        var xmlVendedores = req.responseXML; //<VENDEDORES><VENDEDOR><VendorID>1</VendorID><Name>International</Name><numeroPedidos>51</numeroPedidos></VENDEDOR> ...
        var elementoRaiz = xmlVendedores.documentElement; //<VENDEDORES>
        var noType = elementoRaiz.nodeType; //1
        
        //*** obtendo apenas os valores de ID e NOME do cliente
        var lista = elementoRaiz.getElementsByTagName("VENDEDOR");
        var vendedoresSelect = document.getElementById('Select1');

        vendedoresSelect.options[0] = new Option("Selecione um vendedor", "-1");

        for (var i = 0; i < lista.length; i++) {
            var valorOpcaoSelect_ID = lista.item(i).childNodes.item(0).childNodes[0].nodeValue;
            var textoOpcaoSelect_NOME = lista.item(i).childNodes.item(1).childNodes[0].nodeValue;
            var textoOpcaoSelect_QTD = lista.item(i).childNodes.item(2).childNodes[0].nodeValue;
            var param1 = 'Nome: ' + textoOpcaoSelect_NOME + ' Qtde: ' + textoOpcaoSelect_QTD;

            vendedoresSelect.options.add(new Option(param1, valorOpcaoSelect_ID));
        }
    } catch (erro) {
        var mensagem = document.getElementById('mensagens');
        mensagem.appendChild(this.montaMensagem('Erro', 'Houve erro processamento na preparacao do select de vendedores: ' + erro.message, 'alert-error'));
    }
}

//Codigos referentes ao select de pedidos

function processaSelectVendedor(selec) {
    this.limparTabelaDetalhes();

    var selectedIndex = selec.selectedIndex;
    var id = selec.options[selectedIndex].value;
    if (id >= 0) {
        var param = "id=" + id;
        enviarRequisicaoHTTP("RetornaDadosPedidos.aspx", param, "POST", processaRespostaPedido);
    }
}

function processaRespostaPedido() {
    if (req.readyState == READY_STATE_COMPLETO) {
        preparaSelectPedidos();
    }
}

function preparaSelectPedidos() {
    try {
        var strJson = req.responseText; //{"PurchaseOrderID":"44", "OrderDate":"2/16/2002 12:00:00 AM"};{...};
        var jsonStrings = strJson.split(';');
        var pedidosSelect = document.getElementById('Select2');
        var json = {};

        jsonStrings.pop();
        pedidosSelect.options[0] = new Option("Selecione um pedido", "-1");

        for (var i = 0; i < jsonStrings.length; i++) {
            json = jsonStrings[i].parseJSON();
            
            var valorOpcaoSelect_ID = json.PurchaseOrderID;
            var textoOpcaoSelect_DATA = json.OrderDate;
            var param1 = 'Id: ' + valorOpcaoSelect_ID + ' Data: ' + textoOpcaoSelect_DATA;

            pedidosSelect.options.add(new Option(param1, valorOpcaoSelect_ID));
        }
    } catch (erro) {
        var mensagem = document.getElementById('mensagens');
        mensagem.appendChild(this.montaMensagem('Erro', 'Houve erro processamento: ' + erro.message, 'alert-error'));
    }
}

//Codigos referentes a tabela de detalhes de um pedido

function processaTabelaPedido(selec) {
    this.limparTabelaDetalhes();

    var selectedIndex = selec.selectedIndex;
    var id = selec.options[selectedIndex].value;
    if (id >= 0) {
        var param = "id=" + id;
        enviarRequisicaoHTTP("RetornaDetalhesPedido.aspx", param, "POST", processaRespostaDetalhePedido);
    }
}

function processaRespostaDetalhePedido() {
    if (req.readyState == READY_STATE_COMPLETO) {
        preparaTabelaDetalhePedido();
    }
}

function preparaTabelaDetalhePedido() {
    try {
        this.limparTabelaDetalhes();
        var xmlDetalhes = req.responseXML; //<DETALHES><DETALHE><Name>Lower Head Race</Name><UnitPrice>47.6805</UnitPrice><OrderQty>3</OrderQty></DETALHE></DETALHES>
        var elementoRaiz = xmlDetalhes.documentElement; //<DETALHES>
        var noType = elementoRaiz.nodeType; //1

        var tabela = document.getElementById('tabela');
        var total = 0;

        var lista = elementoRaiz.getElementsByTagName("DETALHE");
        for (var i = 0; i < lista.length; i++) {
            var vlrDescricao    = lista.item(i).childNodes.item(0).childNodes[0].nodeValue;
            var vlrPreco        = lista.item(i).childNodes.item(1).childNodes[0].nodeValue;
            var vlrQuantidade   = lista.item(i).childNodes.item(2).childNodes[0].nodeValue;
            var vlrTotalProdudo = lista.item(i).childNodes.item(3).childNodes[0].nodeValue;

            var div = document.createElement('div');
            div.setAttribute('class', 'tr');
            tabela.appendChild(div);

            var descricao = document.createElement('div');
            descricao.setAttribute('class', 'td');
            div.appendChild(descricao);

            var preco = document.createElement('div');
            preco.setAttribute('class', 'td');
            div.appendChild(preco);

            var quantidade = document.createElement('div');
            quantidade.setAttribute('class', 'td');
            div.appendChild(quantidade);

            var totalProdudo = document.createElement('div');
            totalProdudo.setAttribute('class', 'td');
            div.appendChild(totalProdudo);

            var both = document.createElement('div');
            both.setAttribute('style', 'clear: both');
            div.appendChild(both);

            descricao.appendChild(document.createTextNode(vlrDescricao));
            preco.appendChild(document.createTextNode(vlrPreco));
            quantidade.appendChild(document.createTextNode(vlrQuantidade));
            totalProdudo.appendChild(document.createTextNode(vlrTotalProdudo));
            total = total + parseFloat(vlrTotalProdudo);
        }

        var txtTotal = document.getElementById('appendedPrependedInput');
        txtTotal.value = total;
    } catch (erro) {
        var mensagem = document.getElementById('mensagens');
        mensagem.appendChild(this.montaMensagem('Erro', 'Houve erro processamento na preparacao da tabela detalhe pedido: ' + erro.message, 'alert-error'));
    }
}

function montaMensagem(titulo, texto, tipo) {
    var div = document.createElement('div');
    div.setAttribute('class', "alert " + tipo);

    var button = document.createElement('button'),
        close = document.createTextNode('x');

    button.setAttribute('type', 'button');
    button.setAttribute('class', 'close');
    button.setAttribute('data-dismiss', 'alert');
    button.appendChild(close);
    div.appendChild(button);

    var h4 = document.createElement('h4'),
        titH4 = document.createTextNode(titulo);

    h4.appendChild(titH4);
    div.appendChild(h4);

    var textoAlert = document.createTextNode(texto);
    div.appendChild(textoAlert);

    return div;
}

function limparTabelaDetalhes() {
    try {
        $('.tr').remove();
    } catch (e) {
        var mensagem = document.getElementById('mensagens');
        mensagem.appendChild(this.montaMensagem('Erro', 'Houve erro: ' + e.message, 'alert-error')); ;
    }
}
