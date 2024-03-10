import Places from './Places.jsx';
import { useEffect, useState } from 'react';
import Error from './Error.jsx'
import { sortPlacesByDistance } from '../loc.js'
import {fetchAvailablePlaces} from '../http.js'

export default function AvailablePlaces({ onSelectPlace }) {
  const [isFetching, setIsFetchig] = useState(false)
  const [AvailablePlaces, setAvailablePlaces] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      setIsFetchig(true)
      try {
        const places = await fetchAvailablePlaces()

        navigator.geolocation.getCurrentPosition((position) => {
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude
          );
          setAvailablePlaces(sortedPlaces)
          setIsFetchig(false)
        })
      } catch (error) {
        console.log("error", error)
        setError({ message: error.message || 'Could not fetch places please try again later' })
        setIsFetchig(false)
      }
    }
    fetchData();
  }, [])

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