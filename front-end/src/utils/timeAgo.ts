function timeAgo(timestamp: string, lang: string) {
  if (!timestamp) return "";
  const now = new Date() as any;
  const date = new Date(timestamp) as any;
  const seconds = Math.floor((now - date) / 1000) as number;

  let interval = Math.floor(seconds / 31536000);

  if (interval >= 1) {
    if (lang === "fr") {
      if (interval === 1) {
        return "Il y a 1 an";
      } else {
        return `Il y a ${interval} ans`;
      }
    } else {
      if (interval === 1) {
        return "1 year ago";
      } else {
        return `${interval} years ago`;
      }
    }
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    if (lang === "fr") {
      if (interval === 1) {
        return "Il y a 1 mois";
      } else {
        return `Il y a ${interval} mois`;
      }
    } else {
      if (interval === 1) {
        return "1 month ago";
      } else {
        return `${interval} months ago`;
      }
    }
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    if (lang === "fr") {
      if (interval === 1) {
        return "Il y a 1 jour";
      } else {
        return `Il y a ${interval} jours`;
      }
    } else {
      if (interval === 1) {
        return "1 day ago";
      } else {
        return `${interval} days ago`;
      }
    }
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    if (lang === "fr") {
      if (interval === 1) {
        return "Il y a 1 heure";
      } else {
        return `Il y a ${interval} heures`;
      }
    } else {
      if (interval === 1) {
        return "1 hour ago";
      } else {
        return `${interval} hours ago`;
      }
    }
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    if (lang === "fr") {
      if (interval === 1) {
        return "Il y a 1 minute";
      } else {
        return `Il y a ${interval} minutes`;
      }
    } else {
      if (interval === 1) {
        return "1 minute ago";
      } else {
        return `${interval} minutes ago`;
      }
    }
  }
  if (Math.floor(seconds) < 5) 
  {
    if (lang === "fr") {
      return `À l'instant`;
    } else {
      return  `Just now`;
    }
  }
  if (lang === "fr") {
    return `Il y a ${Math.floor(seconds)} secondes`;
  } else {
    return `${Math.floor(seconds)} seconds ago`;
  }
}

export default timeAgo;
