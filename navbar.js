const searchBar = document.getElementById('nav-search-bar');
const searchResultCont = document.getElementById('search-result-cont');
let searchData = null;
let searchResultsDOMs = null;

document.getElementById('nav-example-btn').addEventListener('click', () => {
	window.open('./projects');
});

document.getElementById('nav-community-btn').addEventListener('click', () => {
	console.log('Community');
});

document.getElementById('nav-faq-btn').addEventListener('click', () => {
	console.log('FAQ');
});

searchBar.addEventListener('input', (event) => {
	if (searchData == null) return;

	const searchKey = event.target.value;
	showSearchResults(searchKey);
});

searchBar.addEventListener('focus', () => {
	searchResultCont.classList.remove('hide');
});

searchBar.addEventListener('blur', () => {
	searchBar.value = '';
});

window.addEventListener('click', (event) => {
	if (searchResultsDOMs == null) return;

	if (!searchResultsDOMs.includes(event.target) && event.target !== searchBar) {
		searchResultCont.classList.add('hide');
		searchResultsDOMs = null;
		searchResultCont.innerHTML = '';
	}
});

function goToSearchResult (result) {
	const resultIndex = pagesData.findIndex(data => data.textURL == result.target);

	if (resultIndex == -1) {
		console.warn('Can\'t find the data');
	} else {
		loadNewPage(resultIndex);
	}
}

function getNewSearchResultObj (obj) {
	const keys = Object.keys(obj);
	const tmp = {};

	keys.forEach(key => {
		tmp[key] = obj[key];
	});

	return tmp;
}

function showSearchResults (searchKey) {
	searchResultCont.innerHTML = '';

	if (searchKey.length < 2) return;

	searchKey = searchKey.toLowerCase();
	const searchResults = [];
	searchResultsDOMs = [];

	searchData.forEach(obj => {
		if (obj.key.includes(searchKey)) {
			const tmpObj = getNewSearchResultObj(obj);
			tmpObj.start = obj.key.indexOf(searchKey);
			tmpObj.end = tmpObj.start + searchKey.length;
			searchResults.push(tmpObj);
		}
	});

	searchResults.forEach(result => {
		const cont = document.createElement('div');

		let txt = result.key[0].toUpperCase() + result.key.substring(1);
		txt = `${txt.substring(0, result.start)}<span>${txt.substring(result.start, result.end)}</span>${txt.substring(result.end)}`;
		cont.innerHTML = txt;
		searchResultCont.appendChild(cont);
		searchResultsDOMs.push(cont);

		cont.addEventListener('click', () => {
			goToSearchResult(result);
			searchResultCont.innerHTML = '';
			searchResultCont.classList.add('hide');
		});
	});
}

async function loadSearchData () {
	try {
		const response = await fetch('res/search.json');

		if (!response.ok) {
			throw new Error('Failed to load search data.');
		}

		const data = await response.json();
		searchData = data;
	} catch (error) {
		console.error(error);
	}

	loadSearchData = null;
}

loadSearchData();
