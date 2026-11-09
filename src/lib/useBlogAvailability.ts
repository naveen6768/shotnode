import { useEffect, useState } from "react";
import { listPosts } from "./blogApi";
import { launchPosts } from "../data/launchPosts.js";

let publishedPostsAvailable: Promise<boolean> | null = null;

/** Show the blog when launch editorial or CMS stories are available. */
export function useBlogAvailability(): boolean {
  const [available, setAvailable] = useState(launchPosts.length > 0);

  useEffect(() => {
    let mounted = true;
    publishedPostsAvailable ??= listPosts({ limit: 1 })
      .then(({ items }) => items.length > 0)
      .catch(() => false);
    void publishedPostsAvailable.then((result) => {
      if (mounted) setAvailable(result);
    });
    return () => { mounted = false; };
  }, []);

  return available;
}
