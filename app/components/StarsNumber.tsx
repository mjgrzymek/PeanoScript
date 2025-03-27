export default async function StarsNumber() {
  let stars_count = 30;
  try {
    const repo = "mjgrzymek/PeanoScript";
    const apiPath = `https://api.github.com/repos/${repo}`;
    const stars = await fetch(`${apiPath}`);
    const { stargazers_count } = await stars.json();
    if (typeof stargazers_count === "number") {
      stars_count = stargazers_count;
    }
  } catch {}
  return `⭐ ${stars_count} stars`;
}
