import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { updateUserPlaces } from './http.js'
import { getUSerPlaces } from './http.js';
import Error from './components/Error.jsx'

function App() {
  const selectedPlace = useRef();
  const [userPlaces, setUserPlaces] = useState([]);
  const [error, setError] = useState('');
  const [isFetching, setIsFetching] = useState(false)

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  useEffect(() => {
    async function getUserPlace() {
      setIsFetching(true)
      try {
        const places = await getUSerPlaces();
        setUserPlaces(places)
      }
      catch (error) {
        setError({ message: error.message || 'failed to fetch places' })
      }
      setIsFetching(false)
    }
    getUserPlace();
  }, [])

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });
    try {
      //not passing userPlaces directly as state update would not be immediately be available in this next line of code instead it would only be vailable afer the component function executed the next time which is scheduled by state update in above lines 
      //but this line would execute before that happens
      await updateUserPlaces([selectedPlace, ...userPlaces])
    } catch (error) {
      setUserPlaces(userPlaces)
      setErrorUpdatingPlaces({ message: error.message || 'Failed to update places' })
    }
  }

  const handleRemovePlace = useCallback(async function handleRemovePlace() {
    setUserPlaces((prevPickedPlaces) =>
      prevPickedPlaces.filter((place) => place.id !== selectedPlace.current.id)
    );
    try {
      await updateUserPlaces(userPlaces.filter(place => place.id !== selectedPlace.id))
    } catch (error) {
      setUserPlaces(userPlaces)
      setErrorUpdatingPlaces({ message: error.message || 'Failed to delete' })
    }
    setModalIsOpen(false);
  }, [userPlaces]);

  function handleError() {
    setErrorUpdatingPlaces(null)
  }

  return (
    <>
      {/* this model is for showing error if something wrong happens while updating the  selected places */}
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (<Error
          title="An error occured"
          message={errorUpdatingPlaces.message}
          onConfirm={handleError} />)}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title="An error occurred" message={error.message} />}
        {!error && <Places
          title="I'd like to visit ..."
          loading={isFetching}
          loadingText="Fetching places"
          fallbackText="Select the places you would like to visit below."
          places={userPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        }

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
