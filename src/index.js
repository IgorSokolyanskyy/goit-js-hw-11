import { Notify } from 'notiflix/build/notiflix-notify-aio';
// Описан в документации
import SimpleLightbox from 'simplelightbox';
// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';
import { InfiniteScroll } from 'infinite-scroll';
import './css/styles.css';
import { ImagesApiService } from './components/api-service';
// import { createImagesMarkup } from './components/createImagesMarkup';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.form.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

const imagesApiService = new ImagesApiService();

let gallery = new SimpleLightbox('.photo-card a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

let imagesShown = 0;

function onFormSubmit(e) {
  e.preventDefault();
  clearMarkUp();
  refs.loadMoreBtn.classList.add('is-hidden');

  imagesShown = 0;

  imagesApiService.resetPage();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();

  if (!imagesApiService.query) {
    Notify.info('Empty request, please type not only spaces');
    return;
  }

  fetchImages();
}

async function fetchImages() {
  try {
    const { hits, totalHits, total } = await imagesApiService.fetchImages();

    if (!hits.length) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }
    createImagesMarkup(hits);

    if (imagesApiService.page > 2) {
      smoothScroll();
    }

    if (!imagesShown) {
      Notify.success(
        `We found ${totalHits} , buy licence to get more, total found ${total}`
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
}

function createImagesMarkup(imagesData) {
  const markup = imagesData
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="photo-card"><a href="${largeImageURL}">
  <img src="${webformatURL}" width='350' height='250' alt="${tags}" loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      <b>Likes <span>${likes}</span> </b>
    </p>
    <p class="info-item">
      <b>Views <span> ${views}</span></b>
    </p>
    <p class="info-item">
      <b>Comments <span>${comments}</span></b>
    </p>
    <p class="info-item">
      <b>Downloads <span>${downloads}</span></b>

    </p>
  </div>
</div>`;
      }
    )
    .join(' ');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function clearMarkUp() {
  refs.gallery.innerHTML = ``;
}

function onLoadMore() {
  fetchImages();
}
