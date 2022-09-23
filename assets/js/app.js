// Constantes
const btnBuscar = document.getElementById('btnSearch');
const iptBuscar = document.getElementById('iptSearch');
const gifContainer = document.querySelector('.gif__container');
const gifResults = document.querySelector('.gif__results');
const msgNoResuls = document.getElementById('msg__noresults');
const tituloUltimasBusquedas = document.getElementById('tituloUltimasBusquedas');
const listadoUltimasBusquedas = document.getElementById('listadoUltimasBusquedas');
const api_key = 'nW1yR4rigcTYsWnl0HT6OlroLN1Eu05D';
const gifColCant = 5;
const nombreLocalStorage = 'ultimasBusquedas';

// Variables
let offSetApi = 0;
let buscar = '';
let oldBuscar = '';
let isConsult = false;
let gifColCount = 1;
let primeraConsulta = true;
let ultimasBusquedas = [];

// Eventos
window.addEventListener('load', () => {
	if(localStorage.getItem(nombreLocalStorage)){
		ultimasBusquedas = JSON.parse(localStorage.getItem(nombreLocalStorage));
		printUltimasBusquedas(ultimasBusquedas);
	}
	consultaGiphy();
	btnBuscar.addEventListener("click", function(){
		consultaGiphy();
	});
	iptBuscar.addEventListener("keypress", function(e){
		if(e.key === "Enter"){
			e.preventDefault();
			consultaGiphy();
		}
	})
})

// Set ultimas busquedas
const setUltimasBusquedas = (busqueda) => {
	if(ultimasBusquedas.includes(busqueda)){
		let ultimasBusquedasParcial = ultimasBusquedas.filter((elemento) => elemento !== busqueda);
		ultimasBusquedas = [busqueda, ...ultimasBusquedasParcial];
	}else{
		if(ultimasBusquedas.length == 3){
			ultimasBusquedas.pop();
			ultimasBusquedas = [busqueda, ...ultimasBusquedas];
		}else{
			ultimasBusquedas = [busqueda, ...ultimasBusquedas];
		}
	}
	localStorage.setItem(nombreLocalStorage, JSON.stringify(ultimasBusquedas));
	printUltimasBusquedas(ultimasBusquedas);
}

// Pintar ultimas busquedas
const printUltimasBusquedas = (busquedas) => {
	listadoUltimasBusquedas.innerHTML = '';
	tituloUltimasBusquedas.innerHTML =  ultimasBusquedas.length === 1 ? 'Tu última búsqueda' : 'Tus últimas búsquedas';
	busquedas.map((ultima) => {
		listadoUltimasBusquedas.insertAdjacentHTML('beforeend', `<li onclick='consultaGiphy("${ultima}")'>${ultima}</li>`);
	});
}

// Cargando
const consultaGiphy = async (busqueda = '') => {
	if(busqueda != ''){
		iptBuscar.value = busqueda;
	}
	isConsult = true;
	if(iptBuscar.value.trim() != ''){
		primeraConsulta = false;
		buscar = iptBuscar.value.trim();
		if(oldBuscar != buscar){
			oldBuscar = buscar;
			setUltimasBusquedas(buscar);
			offSetApi = 0;
			for(let i = 1; i < gifColCant; i++){
				let parcial = gifResults.querySelector(`.gif__col:nth-child(${i})`);
				parcial.innerHTML = '';
			} 
		}
	}

	let urlGif = primeraConsulta ? 
				`https://api.giphy.com/v1/gifs/trending?api_key=${api_key}&limit=30&offset=${offSetApi}` :
				`https://api.giphy.com/v1/gifs/search?api_key=${api_key}&limit=30&q=${buscar}&offset=${offSetApi}`;

	await fetch(urlGif)
		.then(response => response.json())
		.then(data => {
			if(data.pagination.total_count > 0){
				offSetApi += 30;
				msgNoResuls.innerHTML = '';
				printGif(data.data);
			}else{
				// Sin Data
				msgNoResuls.innerHTML = `No se encontraron resultados con ${iptBuscar.value}`;
			}
		})
	isConsult = false;  
}

// Pintar Gif en pantalla
const printGif = (data) => {
	data.map((gif)=>{
		let cardGif = `<div class='gif__container'>
							<img src='${gif.images.downsized.url}' alt='${gif.title}'/>
						</div>`;
		
		gifColCount = gifColCount === gifColCant ? 1 : gifColCount;
		
		let parcial = gifResults.querySelector(`.gif__col:nth-child(${gifColCount})`);
		
		parcial.insertAdjacentHTML('beforeend', cardGif);
		
		gifColCount++;
	})
}

window.addEventListener('scroll', async () => {
	if (isConsult) return;
	// Final de la pagina
	if(window.innerHeight + window.scrollY >= document.body.offsetHeight){
		consultaGiphy();
	}
});