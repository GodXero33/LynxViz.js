const NOT_FOUND_404_TXT = `Wtf man!`;
const LOADER_TRIGGER_WAIT_TIME = 2500;
const OLD_PAGE_REMOVE_TIME = 1000;

const pageCont = document.getElementById('pages-container');
const loadingCont = document.getElementById('loading-wrapper');
const navigatorBtns = [document.getElementById('navigator-prev'), document.getElementById('navigator-next')];
let currentPage = null;
let isPageLoading = false;
let pagesData = null;
let loaderShowTimeOut = null;
let currentPageIndex = 0;

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
	const pageContent = document.createElement('div');
	page.classList.add('page-cont');
	page.classList.add('hide');
	pageContent.classList.add('page-content');

	if (currentPage == null) {
		page.classList.remove('hide');
	}

	page.appendChild(pageContent);
	pageCont.appendChild(page);
	
	return new Promise(async (res, rej) => {
		const textData = await loadTextContent(pageData.textURL);
		
		if (pageData.bgURL) {
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
		}

		pageContent.innerHTML = textData;

		if (currentPage == null) {
			currentPage = page;
			rej('init');
		} else {
			res(page);
		}
	});
}

async function loadNewPage (pageDataIndex) {
	if (isPageLoading || pagesData == null || pageDataIndex < 0 || pageDataIndex > pagesData.length - 1) return;

	isPageLoading = true;
	currentPageIndex = pageDataIndex;
	const pageData = pagesData[pageDataIndex];

	if (pageDataIndex == 0) {
		navigatorBtns[0].classList.add('hide');
	} else if (navigatorBtns[0].classList.contains('hide')) {
		navigatorBtns[0].classList.remove('hide');
	}
	
	if (pageDataIndex == pagesData.length - 1) {
		navigatorBtns[1].classList.add('hide');
	} else if (navigatorBtns[1].classList.contains('hide')) {
		navigatorBtns[1].classList.remove('hide');
	}
	
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
	loadNewPage(0);
	init = null;

	navigatorBtns[0].addEventListener('click', () => {
		loadNewPage(currentPageIndex - 1);
	});

	navigatorBtns[1].addEventListener('click', () => {
		loadNewPage(currentPageIndex + 1);
	});
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

