function validateGenere(genere, valid_generes){
  return valid_generes.map(genere => genere.toLowerCase()).includes(genere.toLowerCase());
}

function validateMovieRecord(req, res, next){
  const valid_generes = ['Drama', 'Action', 'Comedy', 'Fantasy', 'Romance', 'Horror', 'Western', 'Science fiction', 'Adventure', 'Documentary', 'Animation'];
  const {title, release_year, genere, synopsis, country, views, directed_by, main_actors} = req.body;
  let errors = [];

  if(!title || title.trim().length === 0){
    errors.push('Title is required');
  }

  if(!release_year || release_year.toString().trim().length === 0){
    errors.push('Release Year is required');
  }else if(release_year > new Date().getFullYear()){
    errors.push('Release year cannot be greater than current year')
  }

   if(!country || country.trim().length === 0){
    errors.push('Country is required');
  }

   if(!views || views.toString().trim().length === 0){
    errors.push('Views is required');
  }

  if(!genere || genere.trim().length === 0){
    errors.push('Genere is required');
  }else if(!validateGenere(genere, valid_generes)){
    errors.push(`Invalid genere, please choose one of the following list ${JSON.stringify(valid_generes)}`)
  }

  if(!directed_by || directed_by.trim().length === 0){
    errors.push('Directed By is required');
  }

  if(!main_actors || main_actors.length <=0){
    errors.push('Main Actors/Acreesses is required');
  }

  if(!synopsis || synopsis.trim().length === 0){
    errors.push('Synopsis is required');
  }


  if(errors.length>0){
        return res.status(400).json({
        success: false,
        error: `Bad Request - Invaild data:  ${errors}`
    });
  }

  next();

}

module.exports = {  validateMovieRecord };