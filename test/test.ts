const repo = "mjgrzymek/PeanoScript";
const apiPath = `https://api.github.com/repos/${repo}`;
const stars = await fetch(`${apiPath}`);
const stuff = await stars.json();
console.log(stars, "abc", stuff);
export {};
