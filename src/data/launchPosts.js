/**
 * Launch editorial content. The CMS remains authoritative: a CMS post with the
 * same slug replaces the corresponding entry here. Keep slugs stable when
 * migrating these articles into the CMS.
 */
const author = {
  slug: "shotnode-editorial",
  displayName: "ShotNode Editorial",
  kind: "organization",
  avatarUrl: null,
  bio: "Practical ideas for making more thoughtful videos, one small decision at a time.",
  links: {},
};

const category = { slug: "creator-guides", name: "Creator Guides" };
const image = (name, alt) => ({
  mediaId: `launch-${name}`,
  alt,
  width: 1200,
  height: 675,
  src: `/blog/${name}.jpg`,
  srcset: "",
  ogSrc: `/blog/${name}.jpg`,
});
const tag = (slug, name) => ({ slug, name });

export const launchPosts = [
  {
    id: "launch-story-from-clips",
    slug: "turn-everyday-clips-into-a-story",
    status: "published",
    origin: "editorial",
    title: "How to turn everyday clips into a story worth sharing",
    excerpt: "A simple five-beat framework for finding a beginning, a change, and an ending in footage you already have.",
    dek: "A stronger video rarely starts with a better camera. It starts with choosing what the viewer should notice, feel, and remember.",
    category,
    tags: [tag("storytelling", "Storytelling"), tag("video-editing", "Video Editing")],
    author,
    agent: null,
    coverImage: image("story-from-clips", "Illustrated video frames arranged into a simple story arc"),
    readingTimeMinutes: 2,
    isFeatured: true,
    firstPublishedAt: "2026-10-26T00:00:00Z",
    updatedAt: "2026-10-26T00:00:00Z",
    toc: [
      { level: 2, text: "Start with one sentence", anchor: "start-with-one-sentence" },
      { level: 2, text: "Build a five-beat sequence", anchor: "build-a-five-beat-sequence" },
      { level: 2, text: "Make every cut earn its place", anchor: "make-every-cut-earn-its-place" },
      { level: 2, text: "Finish with the feeling", anchor: "finish-with-the-feeling" },
    ],
    bodyHtml: `
      <p>You have twelve short clips from a weekend walk. There is a street corner, a friend laughing, a cup of tea, a wide shot of the sky. None of them seems like a “story” on its own. That is normal. A story is the relationship between moments, not a property of any one clip.</p>
      <h2 id="start-with-one-sentence">Start with one sentence</h2>
      <p>Before you open an editor, describe the video in one sentence: “We went out looking for a quiet place and found one.” This sentence is a decision tool. If a clip does not help show the search, the discovery, or the feeling afterward, you can leave it out.</p>
      <p>Keep the sentence small and specific. “My whole weekend” asks too much of a short video. “The ten minutes before the rain arrived” gives you a clear point of view.</p>
      <h2 id="build-a-five-beat-sequence">Build a five-beat sequence</h2>
      <p>Arrange a first draft with five jobs in mind:</p>
      <ol><li><strong>Place:</strong> show where we are.</li><li><strong>Intention:</strong> show what someone is trying to do.</li><li><strong>Detail:</strong> move closer to something the viewer may have missed.</li><li><strong>Change:</strong> reveal what became different.</li><li><strong>Afterglow:</strong> end on an image or sound that lets the moment settle.</li></ol>
      <p>These beats are a guide, not a rigid template. A single shot can do two jobs. A reaction may be a better opening than a wide establishing shot. The useful question is whether the viewer can feel movement from one moment to the next.</p>
      <h2 id="make-every-cut-earn-its-place">Make every cut earn its place</h2>
      <p>Play the sequence without music. At each cut, ask what the new shot adds: information, emotion, scale, or rhythm. If it repeats the previous shot, shorten it or remove it. Try cutting on an action, a glance, or a sound; those moments make the next image feel connected.</p>
      <p>Leave a little room around the important moment. A laugh lands better when we see the breath before it. A reveal feels larger when we have time to anticipate it. Fast editing is useful only when speed serves the story.</p>
      <h2 id="finish-with-the-feeling">Finish with the feeling</h2>
      <p>Watch your edit once on a phone with the sound low. What do you remember afterward? If the answer is unclear, strengthen the opening and ending before adding effects. A good ending does not need to explain the whole video; it should make the central feeling easy to carry away.</p>
      <p>Save the unused clips. They may belong to another story. The goal is not to fit everything you captured into one video. It is to make one moment feel complete.</p>
    `,
    seoTitle: "How to Turn Everyday Clips Into a Story",
    seoDescription: "Use a simple five-beat framework to turn everyday video clips into a clear, memorable story.",
    canonicalUrl: null,
    noindex: false,
    ogImage: image("story-from-clips", "Illustrated video frames arranged into a simple story arc"),
    aiDisclosure: "This article was drafted with AI assistance for ShotNode.",
    reviewedAt: null,
  },
  {
    id: "launch-first-three-seconds",
    slug: "make-the-first-three-seconds-count",
    status: "published",
    origin: "editorial",
    title: "Make the first three seconds count",
    excerpt: "Design an opening that gives viewers a reason to stay without relying on noise or a misleading hook.",
    dek: "The opening of a short video is a promise. Give people a clear reason to care, then keep that promise.",
    category,
    tags: [tag("storytelling", "Storytelling"), tag("short-form-video", "Short-form Video")],
    author,
    agent: null,
    coverImage: image("first-three-seconds", "Illustration of a phone showing a bold opening frame"),
    readingTimeMinutes: 2,
    isFeatured: false,
    firstPublishedAt: "2026-10-26T00:00:00Z",
    updatedAt: "2026-10-26T00:00:00Z",
    toc: [
      { level: 2, text: "Show the change early", anchor: "show-the-change-early" },
      { level: 2, text: "Choose one visual idea", anchor: "choose-one-visual-idea" },
      { level: 2, text: "Write for a small screen", anchor: "write-for-a-small-screen" },
      { level: 2, text: "Test the promise", anchor: "test-the-promise" },
    ],
    bodyHtml: `
      <p>People often decide whether to keep watching before a video has had time to explain itself. That does not mean every opening needs a dramatic claim or a burst of text. It means the first image should make the next image feel worth seeing.</p>
      <h2 id="show-the-change-early">Show the change early</h2>
      <p>If the video is about a transformation, start near the contrast: the empty desk before it becomes a workspace, the ingredients before dinner, the quiet room before guests arrive. You can reveal the result first or hold it back. Either way, let the viewer know what kind of change is coming.</p>
      <p>An opening question can work too, but make it concrete. “Can this tiny balcony become a garden?” invites curiosity. “You will not believe this” gives the viewer very little to hold onto.</p>
      <h2 id="choose-one-visual-idea">Choose one visual idea</h2>
      <p>Pick a frame with a clear subject and a simple silhouette. On a phone, a close detail often reads faster than a crowded wide shot. Movement can help, but it should point toward the subject: a hand enters frame, a door opens, the camera rounds a corner.</p>
      <p>Try a silent thumbnail test. Pause on the first frame and shrink it to the size it will appear in a feed. Can you still tell what matters? If not, crop tighter, move closer, or choose a cleaner moment.</p>
      <h2 id="write-for-a-small-screen">Write for a small screen</h2>
      <p>If you use on-screen text, write one short thought. Give it enough contrast and breathing room to survive over moving footage. Keep important words away from the edges, where app controls or screen crops may cover them. Read it once at normal playback speed; if you cannot finish, shorten it.</p>
      <p>Captions can make speech accessible and help people watching without sound. They should support the image rather than compete with it. When both text and imagery demand attention, simplify one of them.</p>
      <h2 id="test-the-promise">Test the promise</h2>
      <p>Watch only the first three seconds, then stop. What do you expect the rest of the video to deliver? Play the full edit and see whether it answers that expectation. If the opening promises a result the video never shows, revise it. Trust is a better reason to return than surprise alone.</p>
      <p>One useful exercise is to make three openings from the same footage: begin with the result, begin with the obstacle, and begin with a striking detail. Choose the one that makes the real story clearest.</p>
    `,
    seoTitle: "Make the First Three Seconds of a Video Count",
    seoDescription: "Practical ways to design a clear, compelling opening for short videos without misleading hooks.",
    canonicalUrl: null,
    noindex: false,
    ogImage: image("first-three-seconds", "Illustration of a phone showing a bold opening frame"),
    aiDisclosure: "This article was drafted with AI assistance for ShotNode.",
    reviewedAt: null,
  },
  {
    id: "launch-sound-and-pacing",
    slug: "edit-with-sound-and-pacing",
    status: "published",
    origin: "editorial",
    title: "Edit with sound and pacing, not just transitions",
    excerpt: "Use natural audio, pauses, and rhythm to make a short video feel more intentional.",
    dek: "The sound between shots can carry a story as strongly as the pictures. Start listening before you reach for another effect.",
    category,
    tags: [tag("video-editing", "Video Editing"), tag("audio", "Audio")],
    author,
    agent: null,
    coverImage: image("sound-and-pacing", "Illustration of an audio waveform running through video frames"),
    readingTimeMinutes: 2,
    isFeatured: false,
    firstPublishedAt: "2026-10-26T00:00:00Z",
    updatedAt: "2026-10-26T00:00:00Z",
    toc: [
      { level: 2, text: "Listen to the raw clips", anchor: "listen-to-the-raw-clips" },
      { level: 2, text: "Use sound to lead a cut", anchor: "use-sound-to-lead-a-cut" },
      { level: 2, text: "Build a rhythm with contrast", anchor: "build-a-rhythm-with-contrast" },
      { level: 2, text: "Leave room for silence", anchor: "leave-room-for-silence" },
    ],
    bodyHtml: `
      <p>A polished video does not need a transition on every cut. Often, what makes an edit feel smooth is the sound that travels across it: footsteps continuing into the next shot, a voice beginning before the speaker appears, or a brief pause before a reveal.</p>
      <h2 id="listen-to-the-raw-clips">Listen to the raw clips</h2>
      <p>Before choosing music, play your footage with your eyes closed. Notice the textures you captured: traffic, wind, conversation, a kettle, a door. These sounds locate the viewer in the scene. Mark the moments that feel alive even when the image is ordinary.</p>
      <p>Choose one or two sounds as anchors. If a clip has distracting noise, you can lower it or use a cleaner sound from another moment in the same setting. Be careful that the audio still represents what happened.</p>
      <h2 id="use-sound-to-lead-a-cut">Use sound to lead a cut</h2>
      <p>Try starting the next scene's sound a fraction of a second before its image. The ear introduces the new place, so the visual cut feels motivated. You can also let a sound continue after its image disappears. Both approaches create continuity without a visual effect.</p>
      <p>Keep the overlap short and purposeful. If the viewer hears a train but sees a kitchen for too long, the connection becomes confusing. A quick listen on headphones and then on a phone speaker will tell you whether the handoff is clear.</p>
      <h2 id="build-a-rhythm-with-contrast">Build a rhythm with contrast</h2>
      <p>Rhythm is more than cuts landing on a musical beat. Alternate wider views with close details, action with reaction, and quick passages with a longer shot. Let the pace change when the story changes. A video that stays fast throughout has no room to accelerate.</p>
      <p>When music is useful, lower it enough that speech and important natural sounds remain understandable. If you add captions, check that they stay in sync after every timing change.</p>
      <h2 id="leave-room-for-silence">Leave room for silence</h2>
      <p>A near-silent moment can make the next sound feel meaningful. It can also give the viewer time to understand a face, a place, or the outcome of an action. Do not fill every gap simply because the timeline looks empty.</p>
      <p>For a final pass, watch the video once without looking at the screen and once with the sound off. Each pass should still make sense. Where one version feels flat, adjust the sound or image that carries that moment before adding another transition.</p>
    `,
    seoTitle: "Edit Short Videos With Sound and Pacing",
    seoDescription: "Use natural audio, purposeful cuts, and pauses to give short videos a stronger rhythm.",
    canonicalUrl: null,
    noindex: false,
    ogImage: image("sound-and-pacing", "Illustration of an audio waveform running through video frames"),
    aiDisclosure: "This article was drafted with AI assistance for ShotNode.",
    reviewedAt: null,
  },
];

export function findLaunchPost(slug) {
  return launchPosts.find((post) => post.slug === slug) ?? null;
}

export function launchSummaries({ category: categorySlug, tag: tagSlug, author: authorSlug, featured } = {}) {
  return launchPosts.filter((post) =>
    (!categorySlug || post.category?.slug === categorySlug) &&
    (!tagSlug || post.tags.some((item) => item.slug === tagSlug)) &&
    (!authorSlug || post.author?.slug === authorSlug) &&
    (featured === undefined || post.isFeatured === featured),
  );
}
