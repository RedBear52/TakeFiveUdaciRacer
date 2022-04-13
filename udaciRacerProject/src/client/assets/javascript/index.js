// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

//CoderNote: a '+' operator attached to the front of a variable is shorthand for parseInt()!

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

const customTrackNames = {
	'Track 1': 'Alabama Getaway',
	'Track 2': 'Melba Cup',
	'Track 3': 'Magic Valley',
	'Track 4': 'White Lightning',
	'Track 5': 'The Grand Tour',
	'Track 6': 'The Lawnmower Classic',
}

const customRacerNames = {
	'Racer 1': 'Pride',
	'Racer 2': 'Heartache',
	'Racer 3': 'Tears',
	'Racer 4': 'My Heart',
	'Racer 5': 'True Love',
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
			console.log(target)

		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
			console.log(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

function updateStore(state, newState) {
	Object.assign(state, newState)
}
// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	try {
		// TODO - Get player_id and track_id from the store
		const player_id = store.player_id
		const track_id = store.track_id

		// const race = TODO - invoke the API call to create the race, then save the result
		const race = await createRace(player_id, track_id)

		// Updates the store with the race id
		// Compensating for API bug with: race id - 1
		updateStore(store, {race_id: parseInt(race.ID - 1)})

		// render starting UI
		renderAt('#race', renderRaceStartView(track_id, player_id))
		
		// start the countdown by calling the async function runCountdown
		await runCountdown()
		// Calls the async function startRace
		await startRace(store.race_id)
		// Calls the async function runRace
		await runRace(store.race_id)
	} catch (err) {
		console.log('There has been an error! ::', err)
	}
}

function runRace(raceID) {
	try {
		return new Promise(resolve => {
				// Using JS's built in setInterval() to get race info update every 500ms
				const raceUpdates = setInterval(async () => {
				const raceStatus = await getRace(raceID)
				const racerPos = raceStatus.positions
				// Conditional logic to manage rendering functionality based on whether the race status is
				// 'in progress' or 'finished'
					if (raceStatus.status === 'in-progress') {
						renderAt('#leaderBoard', raceProgress(racerPos))
					} else if (raceStatus.status === 'finished') {
						clearInterval(raceUpdates) // to stop the interval from repeating
						renderAt('#race', resultsView(racerPos)) // to render the results view
						resolve(raceStatus) // resolve the promise
					}
				}, 500)
			})
	} catch(err) {
		console.log('Problem with runRace()' + err)
	}
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			// run this DOM manipulation to decrement the countdown for the user
			// TODO - if the countdown is done, clear the interval, resolve the promise, and return
			const countdownInterval = setInterval(() => { 
				if (timer > 0) {
				document.getElementById('big-numbers').innerHTML = --timer
				} else {
					clearInterval(countdownInterval)
					resolve(Promise)
				}
				}, 1000)
		})
	} catch(err) {
		console.log('Problem with runCountdown():', err)
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id)
	// remove class selected from all extant racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	} 
	// add class selected to current target
	target.classList.add('selected')
	// Saving selected racer to the store
	updateStore(store, {player_id: target.id})
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)
	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if (selected) {
		selected.classList.remove('selected')
	}
	// add class selected to current target
	target.classList.add('selected')
	// Save the selected track id to the store
	updateStore(store, {track_id: target.id})
	}

function handleAccelerate() {
	console.log("accelerate button clicked")
	// Invoking API call to accelrate racer based on button clicks
	try {
		accelerate(store.race_id)
	} catch (err) {
		console.log('Problem with handleAccelerate()', err)
	}
}

// ------------------HTML VIEWS ---------------------

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>${customRacerNames[driver_name]}</h3>
			<p>${`Top Speed: ${top_speed}`}</p>
			<p>${`Acceleration: ${acceleration}`}</p>
			<p>${`Handling: ${handling}`}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track, racers) {
	const { id, name } = track

	return `
		<li id="${id}" class="card track">
			<h3>${customTrackNames[name]}</h3>
		</li>
	`
}

function renderCountdown(count) {

	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track) {
	const { id, name } = track

	let index = `Track ${track}`

	return `
		<header>
			<h1>Race: ${customTrackNames[index]}</h1>
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me Rapidly To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}
// ---------------------GET THE YOU THING GOING  ... OR ... JUST USE STYLING ?!---
function raceProgress(positions) {  
	const userPlayer = positions.find(e => e.id == +store.player_id)
	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1
	const results = positions.map(p => {
		if (userPlayer.driver_name == p.driver_name) {
			return `
				<tr>
					<td>
						<h3>${count++} - ${customRacerNames[userPlayer.driver_name]} YOU</h3>
					</td>
				</tr>
			`
		} else {
			return `
				<tr>
					<td>
						<h3>${count++} - ${customRacerNames[p.driver_name]}</h3>
					</td>
				</tr>
			`
		}
	}) 

		return `
			<main>
				<h3>Leaderboard</h3>
				<section id="leaderBoard">
					${results}
				</section>
			</main>
		`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// Making fetch calls (with error handling!) to the necessary API endpoints ___________

function getTracks() {
    return fetch(`${SERVER}/api/tracks`, {
        method: 'GET',
        ...defaultFetchOpts(),
    })
    .then(res => res.json())
    .catch(err => console.log("Problem with getTracks request::", err))
}

function getRacers() {
    return fetch(`${SERVER}/api/cars`, {
        method: 'GET',
        ...defaultFetchOpts(),
    })
    .then(res => res.json())
    .catch(err => console.log("Problem with getRacers request::", err))
}

function createRace(player_id, track_id) {
    player_id = +player_id
    track_id = +track_id
    const body = { player_id, track_id }

    return fetch(`${SERVER}/api/races`, {
        method: 'POST',
        ...defaultFetchOpts(),
        dataType: 'jsonp',
        body: JSON.stringify(body)
    })
    .then(res => res.json())
    .catch(err => console.log("Problem with createRace request::", err))
}

function getRace(id) {
    return fetch(`${SERVER}/api/races/${id}`, {
        method: 'GET',
        ...defaultFetchOpts(),
    })
    .then(res => res.json())
    .catch(err => console.log("Problem with getRace request::", err))
}

function startRace(id) {
    return fetch(`${SERVER}/api/races/${id}/start`, {
        method: 'POST',
        ...defaultFetchOpts(),
    })
    .catch(err => console.log("Problem with startRace request::", err))
}

function accelerate(id) {
    return fetch(`${SERVER}/api/races/${id}/accelerate`, {
        method: 'POST',
        ...defaultFetchOpts(),
    })
    .catch(err => console.log("Problem with accelerate request::", err))
}
