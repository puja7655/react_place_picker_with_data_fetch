import Places from './Places.jsx';
import Error from './Error.jsx'
import { sortPlacesByDistance } from '../loc.js'
import { fetchAvailablePlaces } from '../http.js'
import { useFetch } from '../hooks/useFetch.js';

//here i am creating a function which can be used is useFetch hook . this function incorporates the extra logic to sort the places which is not
//present in the hook.
async function fetchSortedPlaces() {
  const places = await fetchAvailablePlaces();
  return new Promise((resolve) => { //returning a promise as fetchFun in useFetch hook yield a function which returns a promise
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        places,
        position.coords.latitude,
        position.coords.longitude
      );
      resolve(sortedPlaces)
    })
  })
}

export default function AvailablePlaces({ onSelectPlace }) {

  const {
    isFetching,
    error,
    fetchedData: AvailablePlaces } = useFetch(fetchSortedPlaces, [])

  if (error) {
    return <Error title="An error occurred!" message={error.message} />
  }
  return (
    <Places
      title="Available Places"
      loading={isFetching}
      loadingText="Fetching places data..."
      places={AvailablePlaces}
      fallbackText="No places available."
      onSelectPlace={onSelectPlace}
    />
  );
}