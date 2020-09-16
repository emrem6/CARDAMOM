(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{1040:function(e,t,n){"use strict";n.r(t);var a=n(5),r=n.n(a),i=n(393),o=n.n(i),l=(n(406),n(394));Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));o.a.render(r.a.createElement(l.a,null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then(function(e){e.unregister()})},314:function(e,t){},394:function(e,t,n){"use strict";(function(e){var a=n(398),r=n(14),i=n.n(r),o=n(138),l=n(395),s=n(399),c=n(396),u=n(217),p=n(400),f=n(106),d=n(5),m=d.Component,y=n(1039),h=(y.HashRouter,y.Route,y.Switch,n(415));n(670);var b,w,v,g=n(672),E=n(673)({host:"ipfs.infura.io",port:5001,protocol:"https"}),T="0xd41434a7aff05F0BC72AfbE67734A1fE9c63c209",k=function(t){function n(t){var a;return Object(l.a)(this,n),(a=Object(s.a)(this,Object(c.a)(n).call(this,t))).captureFile=function(t){t.preventDefault();var n=t.target.files[0],r=new window.FileReader;r.readAsArrayBuffer(n),r.onloadend=function(){a.setState({buffer:e(r.result)}),console.log("buffer",a.state.buffer)}},a.onSubmit=function(e){console.log(a.state.contract.methods),e.preventDefault(),console.log("Submitting file to ipfs..."),E.add(a.state.buffer,function(e,t){console.log("Ipfs result",t),e?console.error(e):b.methods.setRequest(t[0].hash).send({from:T})})},a.state={fileHash:"",contract:null,web3:null,buffer:null,account:null,offerPrice:null,offers:[]},a.purchaseOffer=a.purchaseOffer.bind(Object(f.a)(Object(f.a)(a))),a}return Object(p.a)(n,t),Object(u.a)(n,[{key:"componentWillMount",value:function(){var e=Object(o.a)(i.a.mark(function e(){return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.loadWeb3();case 2:return e.next=4,this.loadBlockchainData();case 4:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()},{key:"loadWeb3",value:function(){var e=Object(o.a)(i.a.mark(function e(){return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(!window.ethereum){e.next=8;break}return window.web3=new h(window.ethereum),e.next=4,window.ethereum.enable();case 4:w=window.web3,console.log(window.web3.currentProvider),e.next=9;break;case 8:window.web3?(window.web3=new h(window.web3.currentProvider),console.log(window.web3.currentProvider),w=window.web3):window.alert("Non-Ethereum browser detected. You should consider trying MetaMask!");case 9:case"end":return e.stop()}},e)}));return function(){return e.apply(this,arguments)}}()},{key:"loadBlockchainData",value:function(){var e=Object(o.a)(i.a.mark(function e(){var t,n;return i.a.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return console.log(T),this.setState({account:T}),(b=new w.eth.Contract(g,"0x8285ed4dbfba6faa5bd9da628579239168dd2e06"))?(console.log("Contract is initialized"),console.log(b)):window.alert("Smart contract not deployed to detected network."),this.setState({contract:b}),console.log("CONTRACT: ",b),console.log("Methods: ",b.methods),e.next=9,b.methods.offerCount().call();case 9:t=e.sent,this.setState({offerCount:t}),n=1;case 12:if(!(n<=t)){e.next=21;break}return e.next=15,b.methods.offers(n).call();case 15:v=e.sent,console.log("OFFER: ",v),this.setState({offers:[].concat(Object(a.a)(this.state.offers),[v])});case 18:n++,e.next=12;break;case 21:return console.log("Offers:",this.state.offers),e.t0=console,e.next=25,b.methods.requestCount().call();case 25:e.t1=e.sent,e.t0.log.call(e.t0,e.t1);case 27:case"end":return e.stop()}},e,this)}));return function(){return e.apply(this,arguments)}}()}]),Object(u.a)(n,[{key:"purchaseOffer",value:function(e,t,n){var a=this;this.setState({loading:!0}),console.log("ID",e,"OFFERPRICE",t,"HASH",n,"OWNER",v.owner),console.log(n),this.state.contract.methods.purchaseOffer(e,t,this.state.account,v.provider,n).send({from:this.state.account,value:t}).once("receipt",function(e){a.setState({loading:!1})})}},{key:"render",value:function(){var e=this;return d.createElement("div",null,d.createElement("nav",{className:"navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow"},d.createElement("a",null,"PrinterMarketplace")),d.createElement("div",{className:"container-fluid mt-5"},d.createElement("div",{className:"row"},d.createElement("main",{role:"main",className:"col-lg-12 d-flex text-center"},d.createElement("div",{className:"content mr-auto ml-auto"},d.createElement("p",null,"\xa0"),d.createElement("h2",null,"Change File"),d.createElement("form",{onSubmit:this.onSubmit},d.createElement("input",{type:"file",onChange:this.captureFile}),d.createElement("input",{type:"submit"})),d.createElement("p",null,"\xa0"),d.createElement("h2",null,"Offer Listing"),d.createElement("table",{className:"table"},d.createElement("thead",null,d.createElement("tr",null,d.createElement("th",{scope:"col"},"#"),d.createElement("th",{scope:"col"},"Price"),d.createElement("th",{scope:"col"},"File Hash"),d.createElement("th",{scope:"col"},"Client"),d.createElement("th",{scope:"col"},"Provider"),d.createElement("th",{scope:"col"}))),d.createElement("tbody",null,this.state.offers.map(function(t,n){return d.createElement("tr",{key:n},d.createElement("td",{scope:"row"},t.id.toString()),d.createElement("td",null,w.utils.fromWei(t.price.toString(),"ether")," ETH"),d.createElement("td",null,t.fileHash),d.createElement("td",null,t.client.toString()),d.createElement("td",null,t.provider.toString()),d.createElement("td",null,t.purchased?null:d.createElement("button",{name:t.id,value:t.price,onClick:function(n){e.purchaseOffer(n.target.name,n.target.value,t.fileHash)}},"Buy")))}))))))))}}]),n}(m);t.a=k}).call(this,n(0).Buffer)},401:function(e,t,n){e.exports=n(1040)},424:function(e,t){},426:function(e,t){},517:function(e,t){},587:function(e,t){},670:function(e,t,n){},672:function(e){e.exports=[{constant:!1,inputs:[{internalType:"uint256",name:"_id",type:"uint256"},{internalType:"uint256",name:"_orderPrice",type:"uint256"},{internalType:"address payable",name:"_client",type:"address"},{internalType:"address payable",name:"_provider",type:"address"},{internalType:"string",name:"_fileHash",type:"string"}],name:"purchaseOffer",outputs:[],payable:!0,stateMutability:"payable",type:"function"},{constant:!1,inputs:[{internalType:"uint256",name:"_offerPrice",type:"uint256"},{internalType:"string",name:"_fileHash",type:"string"},{internalType:"address payable",name:"_client",type:"address"},{internalType:"address payable",name:"_provider",type:"address"}],name:"setOffer",outputs:[],payable:!1,stateMutability:"nonpayable",type:"function"},{constant:!1,inputs:[{internalType:"string",name:"_fileHash",type:"string"}],name:"setRequest",outputs:[],payable:!1,stateMutability:"nonpayable",type:"function"},{constant:!0,inputs:[],name:"offerCount",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:!1,stateMutability:"view",type:"function"},{constant:!0,inputs:[{internalType:"uint256",name:"",type:"uint256"}],name:"offers",outputs:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"price",type:"uint256"},{internalType:"string",name:"fileHash",type:"string"},{internalType:"address payable",name:"client",type:"address"},{internalType:"address payable",name:"provider",type:"address"},{internalType:"bool",name:"purchased",type:"bool"}],payable:!1,stateMutability:"view",type:"function"},{constant:!0,inputs:[],name:"orderCount",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:!1,stateMutability:"view",type:"function"},{constant:!0,inputs:[{internalType:"uint256",name:"",type:"uint256"}],name:"orders",outputs:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"uint256",name:"price",type:"uint256"},{internalType:"address payable",name:"client",type:"address"},{internalType:"address payable",name:"provider",type:"address"},{internalType:"bool",name:"purchased",type:"bool"},{internalType:"string",name:"fileHash",type:"string"}],payable:!1,stateMutability:"view",type:"function"},{constant:!0,inputs:[],name:"requestCount",outputs:[{internalType:"uint256",name:"",type:"uint256"}],payable:!1,stateMutability:"view",type:"function"},{constant:!0,inputs:[{internalType:"uint256",name:"",type:"uint256"}],name:"requests",outputs:[{internalType:"uint256",name:"id",type:"uint256"},{internalType:"address payable",name:"client",type:"address"},{internalType:"string",name:"fileHash",type:"string"}],payable:!1,stateMutability:"view",type:"function"}]},741:function(e,t){},774:function(e,t){},776:function(e,t){},795:function(e,t){},797:function(e,t){},804:function(e,t){},806:function(e,t){},812:function(e,t){},813:function(e,t){},827:function(e,t){},829:function(e,t){},836:function(e,t){}},[[401,2,1]]]);
//# sourceMappingURL=main.ece21f8f.chunk.js.map