import { Notify } from 'notiflix/build/notiflix-notify-aio';
// Описан в документации
import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';

import ImagesApiService from './components/api-service';

import imagesCardTpl from './templates/imagesMarkup.hbs';
import getRefs from './components/refs';
import './css/styles.css';

const refs = getRefs();
const imagesApiService = new ImagesApiService();

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

let gallery = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let imagesShown = 0;

function onFormSubmit(e) {
  e.preventDefault();

  refs.loadMoreBtn.classList.add('is-hidden');

  imagesShown = 0;

  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();

  if (!imagesApiService.query) {
    return Notify.info('Empty request, please type not only spaces');
  }

  imagesApiService.resetPage();
  clearMarkup();
  fetchImages(refs.form.reset());
}

async function fetchImages() {
  try {
    const { hits, totalHits, total } = await imagesApiService.fetchImages();

    if (!hits.length) {
      return Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    const markup = imagesCardTpl(hits);
    refs.gallery.insertAdjacentHTML('beforeend', markup);

    if (imagesApiService.page > 2) {
      Notify.success(
        `We found ${totalHits} , buy licence to get more, total found ${total}`
        // `Hooray! We found ${totalHits} images.`
      );
      smoothScroll();
    }

    if (!imagesShown) {
      Notify.success(
        `We found ${totalHits} , buy licence to get more, total found ${total}`
        // `Hooray! We found ${totalHits} images.`
      );
    }

    imagesShown += hits.length;
    gallery.refresh();

    if (imagesShown < totalHits) {
      refs.loadMoreBtn.classList.remove('is-hidden');
    } else {
      refs.loadMoreBtn.classList.add('is-hidden');
      Notify.info(
        `We are sorry, but you have reached the end of search results. Totally shown: ${imagesShown} images`
      );
    }
  } catch (error) {
    Notify.failure(`${error}`);
  }
  // finally(() => form.reset())
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 1.31,
    behavior: 'smooth',
  });
}

function clearMarkup() {
  refs.gallery.innerHTML = ``;
}

function onLoadMore() {
  fetchImages();
}
