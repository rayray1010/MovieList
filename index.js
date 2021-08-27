const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = []
let filteredMovies = []
const dataPanel = document.querySelector('#data-panel')
const paginator = document.querySelector('.pagination')
const MOVIES_PER_PAGE = 12
const displayMode = document.querySelector('.btn-play-mode')
const container = document.querySelector('.container')
let switcher = true
let page = 1

function renderMovieList(data) {
  let rawHTML = ''
  if (switcher) {
    if (!dataPanel.classList.contains('row')) {
      dataPanel.classList.add('row')
    }
    dataPanel.innerHTML = ''
    data.forEach((element) => {
      rawHTML += `
    <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + element.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${element.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${element.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${
                element.id
              }">+</button>
            </div>
          </div>
        </div>
      </div>
    `
    })
  } else {
    if (dataPanel.classList.contains('row')) {
      dataPanel.classList.remove('row')
    }
    dataPanel.innerHTML = ''
    rawHTML += `<ul class="list-group">`
    data.forEach((element) => {
      rawHTML += `
      <li class="list-group-item d-flex justify-content-between">
        <p>${element.title}</p>
        <div>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal"data-target="#movie-modal" data-id="${element.id}">
            More
          </button>
          <button class="btn btn-info btn-add-favorite" data-id="${element.id}">
            +
          </button>
        </div>
      </li>
      `
    })
    rawHTML += `</ul>`
  }
  dataPanel.innerHTML = rawHTML
}
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))
  })
  .catch((err) => console.log(err))

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => {
    return movie.id === id
  })
  if (
    list.some((movie) => {
      return movie.id === id
    })
  ) {
    return alert('有了拉＝＝')
  }
  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img
    src="${POSTER_URL + data.image}"
    alt="movie-poster" class="img-fluid">
    `
  })
}
const searchInput = document.querySelector('#search-input')
const searchForm = document.querySelector('#search-form')
searchForm.addEventListener('submit', function onSearchFormSubmitted(e) {
  e.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  if (!keyword.length) {
    return alert('請輸入有效字串！')
  }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
})

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function renderPaginator(amount) {
  const pageMount = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= pageMount; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

paginator.addEventListener('click', function onPaginatorClicked(e) {
  if (e.target.tagName !== 'A') return
  page = Number(e.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

displayMode.addEventListener('click', function onDisplayModeClicked(e) {
  if (e.target.matches('#display-card-mode')) {
    switcher = true
    if (filteredMovies.length > 0) {
      renderMovieList(getMoviesByPage(1))
    } else {
      renderMovieList(getMoviesByPage(page))
    }
  } else if (e.target.matches('#display-list-mode')) {
    switcher = false
    if (filteredMovies.length > 0) {
      renderMovieList(getMoviesByPage(1))
    } else {
      renderMovieList(getMoviesByPage(page))
    }
  }
})
