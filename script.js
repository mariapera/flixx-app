const global = {
	currentPage: window.location.pathname,
	api: {
		url: 'https://api.themoviedb.org/3/',
		key: '61b7ca03be93618624729206ebe48422',
	},
	search: {
		type: '',
		term: '',
		page: 1,
		totalPages: 1,
		totalResults: 0,
	},
}

// Fetch Data from API
async function fetchAPIData(endpoint) {
	const url = `${global.api.url}${endpoint}?api_key=${global.api.key}&language=en-US&include_adult=false`

	showSpinner()
	const response = await fetch(url)
	const data = await response.json()
	hideSpinner()
	return data
}

// Search and fetch Movies/TV Shows
async function searchAPIData() {
	showSpinner()
	const response = await fetch(
		`${global.api.url}search/${global.search.type}?query=${global.search.term}&api_key=${global.api.key}&language=en-US&page=${global.search.page}&include_adult=false`
	)
	const data = await response.json()
	hideSpinner()
	return data
}

// Create Slider
function initSlider() {
	const swiper = new Swiper('.swiper', {
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		slidesPerView: 1,
		spaceBetween: 10,
		loop: true,
		breakpoints: {
			576: {
				slidesPerView: 2,
				spaceBetween: 20,
			},
			900: {
				slidesPerView: 3,
				spaceBetween: 30,
			},
			1200: {
				slidesPerView: 4,
				spaceBetween: 40,
			},
		},
	})
}

// Display Movies Now Playing in Slider
async function displayNowPlaying() {
	const { results } = await fetchAPIData('movie/now_playing')
	
	results.forEach(movie => {
		const div = document.createElement('div')
		div.classList.add('swiper-slide')

		div.innerHTML = `
		<a href="./movie-details.html?id=${movie.id}"  class="card-link">
		 <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" class="card-img">
		<h4 class="swiper-rating"><i class="fa-solid fa-star"></i> ${movie.vote_average.toFixed(1)} / 10</h4>
		</a>`
			
		const swiperWrapper = document.querySelector('.swiper-wrapper')
		swiperWrapper.appendChild(div)
	})
	initSlider()
}

// Search Movies/Shows
async  function search() {
	const queryParams = window.location.search
	const searchParams = new URLSearchParams(queryParams)
	global.search.type = searchParams.get('type')
	global.search.term = searchParams.get('term')

	if (global.search.term !== '' && global.search.term !== null) {
		const { page, results, total_pages, total_results } = await searchAPIData()

		if (results.length === 0) {
			showAlert(`No results for ${global.search.term} found`)
			return
		}

		global.search.page = page
		global.search.totalPages = total_pages
		global.search.totalResults = total_results
		displaySearchResults(results)

	} else {
		showAlert('Please enter a search title', 'success')
	}
}

// Display search Movies/TV Shows
async function displaySearchResults(results) {
	document.querySelector('#search').innerHTML = ''
	search
	document.querySelector('.section-search-results .section-title').innerHTML = ''
	document.querySelector('#pagination').innerHTML = ''

	results.forEach(result => {
		const div = document.createElement('div')
		div.classList.add('card')
		div.innerHTML = `
       		<a href=./${global.search.type}-details.html?id=${
			result.id
		} class="card-img">
	   		${
					result.poster_path
						? `<img src="https://image.tmdb.org/t/p/w500/${
								result.poster_path
						  }" alt="${
								global.search.type === 'movie' ? result.title : result.name
						  }">`
						: `<img src="./images/no-image.jpg" alt="${
								global.search.type === 'movie' ? result.title : result.name
						  }">`
				}
        </a>
        <div class="card-body">
            <h5 class='card-title'>${
							global.search.type === 'movie' ? result.title : result.name
						}</h5>
            <p class='card-text'>Release ${
							global.search.type === 'movie'
								? result.release_date
								: result.first_air_date
						}</p>
        </div>
    `
	document.querySelector('.section-search-results .section-title').textContent = `${results.length} of ${global.search.totalResults} results for ${global.search.term}`

	document.querySelector('#search').appendChild(div)
	})

	displayPagination()
}

// Create and Display Pagination For Search
function displayPagination() {
	const div = document.createElement('div')
	div.classList.add('pagination')
	div.innerHTML = `
		<div class="button-box">
			<button class="btn prev">Prev</button>
			<button class="btn next">Next</button>
		</div>
		<p class="page-counter">${global.search.page} of ${global.search.totalPages}</p>
	`
	document.querySelector('#pagination').append(div)

	// If first page show prev button disabled
	if (global.search.page === 1) {
		document.querySelector('.prev').disabled = true
	}

	// If last page show next button disabled
	if (global.search.page === global.search.totalPages) {
		document.querySelector('.next').disabled = true
	}

	// Listening for click on prev page
	document.querySelector('.prev').addEventListener('click', async () => {
		global.search.page--
		const {results, total_pages} = await searchAPIData()
		displaySearchResults(results)
	})

	// Listening for click on next page
	document.querySelector('.next').addEventListener('click', async () => {
		global.search.page++
		const {results, total_pages} = await searchAPIData()
		displaySearchResults(results)
	})
}

// Display 20 most popular movies
async function displayPopularMovies() {
	const popularMovies = document.querySelector('#popular-movies')
	const { results } = await fetchAPIData('movie/popular')

	results.forEach(movie => {
		const div = document.createElement('div')
		div.classList.add('card')
		div.innerHTML = `
       <a href="./movie-details.html?id=${movie.id}" class="card-img">
	   ${
				movie.poster_path
					? `<img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.title}">`
					: `<img src="./images/no-image.jpg" alt="${movie.title}">`
			}
        </a>
        <div class="card-body">
            <h5 class='card-title'>${movie.title}</h5>
            <p class='card-text'>Release ${movie.release_date}</p>
        </div>
    `
		popularMovies.appendChild(div)
	})
}

// Display 20 most popular TV Shows
async function displayPopularTVShows() {
	const popularShows = document.querySelector('#popular-tv-shows')
	const { results } = await fetchAPIData('tv/popular')

	results.forEach(tv => {
		const div = document.createElement('div')
		div.classList.add('card')
		div.innerHTML = `
       <a href="./tv-details.html?id=${tv.id}" class="card-img">
	   ${
				tv.poster_path
					? `<img src="https://image.tmdb.org/t/p/w500/${tv.poster_path}" alt="${tv.name}">`
					: `<img src="./images/no-image.jpg" alt="${tv.name}">`
			}
        </a>
        <div class="card-body">
            <h5 class='card-title'>${tv.name}</h5>
            <p class='card-text'>Release ${tv.first_air_date}</p>
        </div>
    `
		popularShows.appendChild(div)
	})
}

// Display Movie Details
async function displayMovieDetails() {
	const movieDetails = document.querySelector('#movie-details')

	const queryParams = window.location.search
	const movieID = queryParams.split('=')[1]

	const movie = await fetchAPIData(`movie/${movieID}`)

// Overlay for backgroung image
	displayBackgroundImage('movie', movie.backdrop_path)

	const div = document.createElement('div')
	div.classList.add('movie')
	div.innerHTML = `
	<div class="movie-top">
		<div class="image-box">
		${
			movie.poster_path
				? `<img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" alt="${movie.name}">`
				: `<img src="./images/no-image.jpg" alt="${movie.title}">`
		}
		</div>
		<div class="movie-description">
			<h3 class="section-heading">${movie.title}</h3>
			<p class="rating"><i class="fa-solid fa-star"></i><span>${movie.vote_average.toFixed(
				1
			)}</span> / 10</p>
			<p class="release-date">Reliease-date: <span>${movie.release_date}</span></p>
			<p class="overview">${movie.overview}</p>
			<h5 class="section-subheading">Genres</h5>
			<ul class="genres-list">
			 ${movie.genres.map(genre => `<li>${genre.name}</li>`).join('')}
			</ul>
			${
				movie.homepage &&
				`<a href="${movie.homepage}"
		class="btn" target="_blank">Visit homepage</a>`
			}
		</div>
	</div>
	<div class="movie-bottom">
		<h3 class="section-heading">Movie info</h3>
		<ul class="companies-group">
			<li>Budget: <span>$${addCommasToNumber(movie.budget)}</span></li>
			<li>Revenue: <span>$${addCommasToNumber(movie.revenue)}</span></li>
			<li>Runtime: <span>${movie.runtime} minutes</span></li>
			<li>Status: <span>${movie.status}</span></li>
		</ul>
		<h5 class="section-subheading">Production companies</h5>
		<div class="companies-list">
		${movie.production_companies
			.map(company => `<span>${company.name}</span>`)
			.join(', ')}
    	</div>
	</div>
`
	movieDetails.appendChild(div)
}

// Display TV Show Details
async function displayTVShowDetails() {
	const queryParams = window.location.search
	const showID = queryParams.split('=')[1]
	const tv = await fetchAPIData(`tv/${showID}`)

	// Overlay for background image
	displayBackgroundImage('tv', tv.backdrop_path)
	const tvShowDetails = document.querySelector('#tv-show-details')
	const div = document.createElement('div')
	div.classList.add('tv-show')
	div.innerHTML = `
	<div class="tv-show-top">
    	<div class="image-box">
		${
			tv.poster_path
				? `<img src="https://image.tmdb.org/t/p/w500/${tv.poster_path}" alt="${tv.name}">`
				: `<img src="./images/no-image.jpg" alt="${tv.name}">`
		}
    	</div>
    <div class="tv-show-description">
	    <h3 class="section-heading">${tv.name}</h3>
	    <p class="rating"><i class="fa-solid fa-star"></i><span>${tv.vote_average.toFixed(
				1
			)}</span> / 10</p>
	    <p class="release-date">Reliease-date: <span>${tv.first_air_date}</span></p>
	    <p class="overview">${tv.overview}</p>
	    <h5 class="section-subheading">Genres</h5>
	    <ul class="genres-list">
		${tv.genres.map(genre => `<li>${genre.name}</li>`).join('')}
	    </ul>
		${
			tv.homepage &&
			`<a href="${tv.homepage}"
		class="btn" target="_blank">Visit homepage</a>`
		}
    </div>
</div>
<div class="tv-show-bottom">
    <h3 class="section-heading">TV Show info</h3>
    <ul class="companies-group">
	    <li>Number of episodes: <span>${tv.number_of_episodes}</span></li>
	    <li>Last episote to air: <span>${
				tv.last_air_date ? tv.last_air_date : ''
			}</span></li>
	    <li>Status: <span>${tv.status}</span></li>
    </ul>
    <h5 class="section-subheading">Production companies</h5>
    <div class="companies-list">
	${tv.production_companies
		.map(company => `<span>${company.name}</span>`)
		.join(', ')}
    </div>
</div>
`
	tvShowDetails.appendChild(div)
}

// Create and TV Show Backdrop
function displayBackgroundImage(type, backdrop) {
	const backdropPath = `https://image.tmdb.org/t/p/original${backdrop}`

	const div = document.createElement('div')
	div.style.backgroundImage = `url(${backdropPath})`
	div.classList.add('backdrop')

	if (type === 'movie') {
		document.querySelector('.section-movie-details').appendChild(div)
	} else if (type === 'tv') {
		document.querySelector('.section-tv-show-details').appendChild(div)
	}
}

// Show Spinner
function showSpinner() {
	const spinner = document.querySelector('.loading')
	spinner.classList.add('show')
}

// Hide Spinner
function hideSpinner() {
	const spinner = document.querySelector('.loading')
	spinner.classList.remove('show')
}

// Create and display alert
function showAlert(message, className = 'error') {
	const sectionSearchForm = document.querySelector('.section-search-form')
	const div = document.createElement('div')
	div.classList.add('alert', className)
	div.appendChild(document.createTextNode(message))
	sectionSearchForm.append(div)

	setTimeout(() => div.remove(), 3000)
}

// Add highlight for active link
function highlightActiveLink() {
	const navLinks = document.querySelectorAll('.nav-link')
	navLinks.forEach(link => {
		if (global.currentPage === link.getAttribute('href')) {
			link.classList.add('active')
		}
	})
}

// Add commas to numbers
function addCommasToNumber(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Create Router
function init() {
	switch (global.currentPage) {
		case '/':
		case '/index.html':
			displayNowPlaying()
			displayPopularMovies()
			break
		case '/tv-shows.html':
			displayPopularTVShows()
			break
		case '/movie-details.html':
			displayMovieDetails()
			break
		case '/tv-details.html':
			displayTVShowDetails()
			break
		case '/search.html':
			search()
			break
	}
	highlightActiveLink()
}

document.addEventListener('DOMContentLoaded', init)
