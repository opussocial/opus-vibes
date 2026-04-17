import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_header, get_footer } from "./TemplateTags";

// Import templates
import { 
  DefaultTemplate, 
  PageTemplate, 
  HostelTemplate, 
  MagazineTemplate, 
  ProjectTemplate, 
  AuthorTemplate,
  ArtGalleryTemplate,
  ExhibitionTemplate,
  ArtworkTemplate,
  BookTemplate,
  BookstoreTemplate,
  ChapterTemplate,
  CharacterTemplate,
  CreativeAgencyTemplate,
  IssueTemplate,
  MusicStudioTemplate,
  ProfileTemplate,
  RecordingSessionTemplate,
  RoomTemplate,
  SceneTemplate,
  StoryTemplate,
  TagTemplate,
  TrackTemplate,
  AssetTemplate,
  BedTemplate
} from "./templates/Default";

const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  "art-gallery": ArtGalleryTemplate,
  "article": DefaultTemplate,
  "artwork": ArtworkTemplate,
  "asset": AssetTemplate,
  "author": AuthorTemplate,
  "bed": BedTemplate,
  "book": BookTemplate,
  "bookstore": BookstoreTemplate,
  "chapter": ChapterTemplate,
  "character": CharacterTemplate,
  "creative-agency": CreativeAgencyTemplate,
  "exhibition": ExhibitionTemplate,
  "hostel": HostelTemplate,
  "issue": IssueTemplate,
  "magazine": MagazineTemplate,
  "music-studio": MusicStudioTemplate,
  "page": PageTemplate,
  "profile": ProfileTemplate,
  "project": ProjectTemplate,
  "recording-session": RecordingSessionTemplate,
  "room": RoomTemplate,
  "scene": SceneTemplate,
  "story": StoryTemplate,
  "tag": TagTemplate,
  "track": TrackTemplate,
};

export const ElementPage = ({ settings, currentUser }: any) => {
  const { slug, id } = useParams();
  const identifier = id || slug;
  const [element, setElement] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElement = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/theme/element/${identifier}`);
        const data = await res.json();
        setElement(data.element);
      } catch (err) {
        console.error("Failed to fetch element:", err);
      } finally {
        setLoading(false);
      }
    };
    if (identifier) fetchElement();
  }, [identifier]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!element) return <div className="p-8 text-center">Element not found</div>;

  const Template = TEMPLATE_MAP[element.type_slug] || DefaultTemplate;

  return (
    <div className="min-h-screen bg-white">
      {get_header(settings)}
      <main className="max-w-7xl mx-auto p-8">
        <Template element={element} settings={settings} />
      </main>
      {get_footer(settings)}
    </div>
  );
};
