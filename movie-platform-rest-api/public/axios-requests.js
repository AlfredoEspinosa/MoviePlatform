import { get } from 'axios';

async function getAllMovies() {
  try {
    const response = await get('http://localhost:3000/api/movies');
    return response.data;
  } catch (error) {
    console.error('Axios error:', error.message);
    throw error;
  }
}

export default {
    getAllMovies
}