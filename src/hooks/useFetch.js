//this hook gets the fetched data and returns the fetcheddata.

import { useEffect, useState } from "react";

export function useFetch(fetchFun, initialValue) {
    const [fetchedData, setFetchedData] = useState(initialValue);
    const [error, setError] = useState();
    const [isFetching, setIsFetching] = useState()
    useEffect(() => {
        async function getData() {
            setIsFetching(true)
            try {
                const data = await fetchFun();
                setFetchedData(data)
            }
            catch (error) {
                setError({ message: error.message || 'failed to fetch data' })
            }
            setIsFetching(false)
        }
        getData();
    }, [fetchFun])

    return {
        isFetching,
        error,
        fetchedData,
        setFetchedData,
    }
}

//we can also return set function like setFetchedData .
//every custome hook maintains its seperate state just like built inhooks (usState)