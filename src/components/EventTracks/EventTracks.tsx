import { eventTracks } from "../../data/eventTracks";

export function EventTracks() {
  return (
    <section
      id="event-tracks"
      className="section event-tracks-section"
      aria-labelledby="event-tracks-title"
    >
      <div className="container">
        <div className="event-tracks-intro">
          <div className="section-heading">
            <p className="eyebrow">ست تجارب مترابطة</p>
            <h2 id="event-tracks-title">مسارات الحدث وأركانه</h2>
          </div>
          <p>ست تجارب تجمع تاريخ كرة القدم السعودية بصناعتها وفرصها ومستقبلها.</p>
        </div>

        <div className="event-tracks-grid">
          {eventTracks.map((track) => (
            <article
              className={`event-track-card event-track-card--${track.accent}`}
              key={track.number}
            >
              <span className="event-track-number" aria-hidden="true">
                {track.number}
              </span>
              <h3>{track.title}</h3>
              <p>{track.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
