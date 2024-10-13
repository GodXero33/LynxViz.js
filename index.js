const NOT_FOUND_404_TXT = `Wtf man!`;
const LOADER_TRIGGER_WAIT_TIME = 2500;
const OLD_PAGE_REMOVE_TIME = 1000;

const mainCont = document.getElementById('main-container');
const loadingCont = document.getElementById('loading-wrapper');
let currentPage = null;
let isPageLoading = false;
let pagesData = null;
let loaderShowTimeOut = null;

function loadTextContent (url) {
	return new Promise(async (req, rej) => {
		try {
			const response = await fetch(`docs/${url}`);

			if (!response.ok) {
				throw new Error('Failed to fetch text data.');
			}

			const text = await response.text();
			req(text);
		} catch (error) {
			req(NOT_FOUND_404_TXT);
		}
	});
}

function loadBGImage (url) {
	return new Promise(async (req, rej) => {
		const image = new Image();
		image.src = `res/images/docs_bg/${url}`;

		image.onload = () => {
			req(image);
		}

		image.onerror = () => {
			rej('Failed to load the image\n' + image.src);
		}
	});
}

function createNewPage (pageData) {
	const page = document.createElement('div');
	page.classList.add('page-container');
	page.classList.add('hide');

	if (currentPage == null) {
		page.classList.remove('hide');
	}

	mainCont.appendChild(page);
	
	return new Promise(async (res, rej) => {
		const textData = await loadTextContent(pageData.textURL);
		let bgImage = null;

		await loadBGImage(pageData.bgURL).then(img => {
			bgImage = img;
		}).catch(error => {
			console.error(error);
		});

		if (bgImage == null) {
			if (!confirm('This page has some UI esues. Do you want to continue?')) {
				rej('somthing went wrong');
				page.remove();
				return;
			}
		} else {
			page.style.backgroundImage = `url(${bgImage.src})`;
		}

		page.innerHTML = textData;

		if (currentPage == null) {
			currentPage = page;
			rej('init');
		} else {
			res(page);
		}
	});
}

async function loadNewPage (pageData) {
	if (isPageLoading) return;

	isPageLoading = true;
	
	loaderShowTimeOut = setTimeout(() => {
		loadingCont.classList.remove('hide');
	}, LOADER_TRIGGER_WAIT_TIME);

	await createNewPage(pageData).then(page => {
		page.classList.remove('hide');
		currentPage.classList.add('remove');
		loadingCont.classList.add('hide');

		const oldPage = currentPage;
		currentPage = page;
		
		setTimeout(() => {
			oldPage.remove();
			isPageLoading = false;
			clearTimeout(loaderShowTimeOut);
		}, OLD_PAGE_REMOVE_TIME);
	}).catch(error => {
		isPageLoading = false;
		clearTimeout(loaderShowTimeOut);

		if (error == 'init') {
			loadingCont.classList.add('hide');
		} else {
			console.error(error);
		}
	});
}

function init () {
	window.addEventListener('click', () => {
		loadNewPage(pagesData[0]);
	});

	loadNewPage(pagesData[0]);

	init = null;
}

async function loadPagesData () {
	try {
		const response = await fetch('res/pages.json');

		if (!response.ok) {
			throw new Error('Failed to response');
		}

		const data = await response.json();
		pagesData = data;
		init();
	} catch (error) {
		console.error(error);
	}

	loadPagesData = null;
}

loadPagesData();
