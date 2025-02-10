import {useEffect, useState} from 'react';
import Search from './components/search';
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {  
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const[searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [isLoading, setIsLoading] = useState(false); 

  useDebounce(()=>setDebouncedSearchTerm(searchTerm), 750, [searchTerm])

  const fetchMovies = async (query = '') => {
    setIsLoading(true); 
    setErrorMessage('');
    try {
      const endpoint = query ?  
      `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` :
      `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);

      if(!response.ok){
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if(data.response=='False'){
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || [])

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies, please try again later');
    } finally{
      setIsLoading(false); 
    }
  }

  useEffect(() => {
    fetchMovies(debouncedSearchTerm); 
  }, [debouncedSearchTerm]);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Herro Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy Without Hassle
          </h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        <section className='all-movies'>
          <h2>All Movies</h2>

          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
};

export default App;
