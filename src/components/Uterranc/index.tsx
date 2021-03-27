import { useEffect } from 'react';
import styles from './utteranc.module.scss';

export default function Utteranc() {

  useEffect(() => {
    let script = document.createElement("script");
    let anchor = document.getElementById("commentsContainer");
    script.setAttribute("src", "https://utteranc.es/client.js");
    script.setAttribute("crossorigin", "anonymous");
    script.setAttribute("async", "true");
    script.setAttribute("repo", "marcelogr1999/IgniteChallengeZero");
    script.setAttribute("issue-term", "pathname");
    script.setAttribute("theme", "github-dark");
    if (document.getElementsByClassName("utterances").length === 0)
      anchor.appendChild(script);
  }, []);
  
  return (
    <div id="commentsContainer" className={styles.commentsContainer} />
  )
}
