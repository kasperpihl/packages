export default function(string) {
  return string.replace(/([A-Z])/g, function($1){
    return "_"+$1.toLowerCase();
  });
}