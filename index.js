{
	let saveData = JSON.parse(localStorage.getItem('lvjs-docs-save'));
	let iframeCont = iframeLoader = iframeTglBtns = pagesListCont = null;
	const prevCopyConts = [];
	const pages = [
		{ name: 'introduction', full: 'introduction' },
		{ name: 'installation', full: 'installation' },
		{ name: 'getstart', full: 'getting started' },
		{ name: 'libmethods', full: 'library methods and properties' }
	];

	if (!saveData) {
		saveData = {
			curPage: 0
		};
	}

	function makeCopyConts () {
		prevCopyConts.forEach(cont => {
			cont[1].removeEventListener('click', cont[2]);
			cont[0].remove();
		});

		prevCopyConts.length = 0;
		const languageConts = Array.from(iframeCont.querySelectorAll('.prism-cont'));
		
		languageConts.forEach(cont => {
			const copyCont = document.createElement('div');
			const copy = document.createElement('div');

			copyCont.classList.add('copy-cont');
			copyCont.title = 'copy-code';

			copyCont.appendChild(copy);
			cont.prepend(copyCont);
			let copyClick;
			
			if (navigator.clipboard) {
				copyClick = async function (event) {
					if (event.target.classList.contains('done')) return;

					const code = cont.querySelector('code');

					if (code) {
						const text = code.textContent;

						try {
							event.target.classList.add('done');
							await navigator.clipboard.writeText(text);

							setTimeout(() => {
								event.target.classList.remove('done');
							}, 2000);
						} catch (error) {
							console.error('Failed to copy: ', error);
							event.target.classList.remove('done');
						}
					}
				}
			} else if (document.execCommand) {
				copyClick = function (event) {
					if (event.target.classList.contains('done')) return;
					
					const code = cont.querySelector('code');
	
					if (code) {
						const text = code.textContent;
						const textarea = document.createElement('textarea');
						textarea.value = text;
						document.body.appendChild(textarea);
						textarea.select();
	
						try {
							document.execCommand('copy');
							event.target.classList.add('done');
	
							setTimeout(() => {
								event.target.classList.remove('done');
							}, 2000);
						} catch (error) {
							console.error('Failed to copy: ', error);
							event.target.classList.remove('done');
						}
	
						document.body.removeChild(textarea);
					}
				}
			}

			copy.addEventListener('click', copyClick);
			prevCopyConts.push([copyCont, copy, copyClick]);
		});
	}

	function setHTMLToIframeCont (text) {
		if (saveData.curPage == 0) {
			iframeTglBtns[0].classList.add('disable');
		} else if (iframeTglBtns[0].classList.contains('disable')) {
			iframeTglBtns[0].classList.remove('disable');
		}
		
		if (saveData.curPage == pages.length - 1) {
			iframeTglBtns[1].classList.add('disable');
		} else if (iframeTglBtns[1].classList.contains('disable')) {
			iframeTglBtns[1].classList.remove('disable');
		}
		
		if (pages[saveData.curPage - 1]) {
			iframeTglBtns[0].title = pages[saveData.curPage - 1].full;
		}

		if (pages[saveData.curPage + 1]) {
			iframeTglBtns[1].title = pages[saveData.curPage + 1].full;
		}

		setTimeout(() => {
			iframeCont.innerHTML = text;
			//<div class="copy-cont" title="copy-code"><div></div></div>
			makeCopyConts();
			Prism.highlightAll();
			iframeLoader.classList.remove('show');
		}, 200);
	}

	async function loadDoc (curPage) {
		iframeLoader.classList.add('show');

		try {
			const response = await fetch(`docs/${pages[curPage].name}.html`);
			
			if (!response.ok) {
				throw new Error('Failed to fetch!');
			}

			const text = await response.text();
			saveData.curPage = curPage;
			localStorage.setItem('lvjs-docs-save', JSON.stringify(saveData));
			setHTMLToIframeCont(text);
		} catch (error) {
			console.error(error);
			iframeLoader.classList.remove('show');
		}
	}

	function generatePagesList () {
		pages.forEach((item, index) => {
			const cont = document.createElement('div');
			cont.classList.add('pages-list-item');

			const words = item.full.split(' ').map(word => word[0].toUpperCase() + word.substring(1));
			cont.textContent = words.join(' ');

			pagesListCont.appendChild(cont);

			cont.addEventListener('click', () => {
				pagesListCont.classList.add('hide');
				saveData.curPage = index;
				loadDoc(saveData.curPage);
			});
		});
	}

	function load () {
		iframeCont = document.getElementById('iframe');
		iframeLoader = document.getElementById('iframe-loader');
		iframeTglBtns = Array.from(document.querySelectorAll('#iframe-tgl-ctrl > div'));
		pagesListCont = document.getElementById('pages-list-cont');

		loadDoc(saveData.curPage);
		generatePagesList();

		iframeTglBtns[0].addEventListener('click', () => {
			let curPage = saveData.curPage - 1;

			if (curPage < 0) {
				curPage = 0;
			} else {
				loadDoc(curPage);
			}
		});
		
		iframeTglBtns[1].addEventListener('click', () => {
			let curPage = saveData.curPage + 1;

			if (curPage > pages.length - 1) {
				curPage = pages.length - 1;
			} else {
				loadDoc(curPage);
			}
		});

		document.getElementById('pages-list-view-btn').addEventListener('click', () => {
			pagesListCont.classList.remove('hide');
		});

		document.getElementById('pages-list-cont-close-btn').addEventListener('click', () => {
			pagesListCont.classList.add('hide');
		});
	}

	window.addEventListener('load', load);
}
