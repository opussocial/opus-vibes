import React from "react";
import { the_title, the_content, the_children, the_neighbors, the_parent } from "../../../TemplateTags";

export const DefaultTemplate = ({ element }: any) => (
  <article className="max-w-4xl mx-auto">
    {the_parent(element)}
    {the_title(element)}
    <div className="text-sm text-gray-500 mb-6 uppercase tracking-widest">{element.type_name}</div>
    {the_content(element)}
    {the_children(element)}
    {the_neighbors(element)}
  </article>
);

export const PageTemplate = ({ element }: any) => (
  <div className="max-w-5xl mx-auto">
    <header className="mb-12 border-b pb-8">
      {the_title(element)}
      <p className="text-xl text-gray-500 italic">Static Page Template</p>
    </header>
    {the_content(element)}
    {the_children(element)}
  </div>
);

export const HostelTemplate = ({ element }: any) => (
  <div className="max-w-6xl mx-auto">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2">
        {the_title(element)}
        <div className="bg-blue-600 text-white px-4 py-2 rounded inline-block mb-6 font-bold">Hostel</div>
        {the_content(element)}
        {the_children(element)}
      </div>
      <div className="bg-gray-50 p-6 rounded-xl border h-fit">
        <h3 className="text-xl font-bold mb-4">Hostel Details</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase text-gray-400 font-bold">Location</label>
            <div className="font-medium">{element.location?.city || "Unknown"}</div>
          </div>
          {the_neighbors(element)}
        </div>
      </div>
    </div>
  </div>
);

export const MagazineTemplate = ({ element }: any) => (
  <div className="max-w-4xl mx-auto">
    <div className="text-center mb-16">
      <div className="text-xs uppercase tracking-[0.3em] text-red-600 font-bold mb-4">Magazine Issue</div>
      {the_title(element)}
      <div className="h-1 w-24 bg-black mx-auto mt-8"></div>
    </div>
    {the_content(element)}
    <div className="mt-12 pt-12 border-t">
      <h3 className="text-2xl font-serif italic mb-8">In this issue</h3>
      {the_children(element)}
    </div>
  </div>
);

export const ProjectTemplate = ({ element }: any) => (
  <div className="max-w-5xl mx-auto">
    <div className="flex flex-col md:flex-row gap-12 items-start">
      <div className="md:w-1/3 sticky top-8">
        <div className="p-8 bg-black text-white rounded-2xl">
          {the_title(element)}
          <div className="mt-4 opacity-70">Project Case Study</div>
        </div>
        <div className="mt-8">
          {the_neighbors(element)}
        </div>
      </div>
      <div className="md:w-2/3">
        {the_content(element)}
        {the_children(element)}
      </div>
    </div>
  </div>
);

export const AuthorTemplate = ({ element }: any) => (
  <div className="max-w-4xl mx-auto text-center">
    <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-8 flex items-center justify-center text-4xl font-bold text-gray-400">
      {element.name.charAt(0)}
    </div>
    {the_title(element)}
    <div className="text-lg text-gray-600 mb-12 italic">Author Profile</div>
    <div className="text-left bg-white p-8 rounded-lg shadow-sm border">
      {the_content(element)}
    </div>
    <div className="mt-12 text-left">
      <h3 className="text-2xl font-bold mb-6">Works by {element.name}</h3>
      {the_children(element)}
    </div>
  </div>
);

export const ArtGalleryTemplate = DefaultTemplate;
export const ExhibitionTemplate = DefaultTemplate;
export const ArtworkTemplate = DefaultTemplate;
export const BookTemplate = DefaultTemplate;
export const BookstoreTemplate = DefaultTemplate;
export const ChapterTemplate = DefaultTemplate;
export const CharacterTemplate = DefaultTemplate;
export const CreativeAgencyTemplate = DefaultTemplate;
export const IssueTemplate = DefaultTemplate;
export const MusicStudioTemplate = DefaultTemplate;
export const ProfileTemplate = DefaultTemplate;
export const RecordingSessionTemplate = DefaultTemplate;
export const RoomTemplate = DefaultTemplate;
export const SceneTemplate = DefaultTemplate;
export const StoryTemplate = DefaultTemplate;
export const TagTemplate = DefaultTemplate;
export const TrackTemplate = DefaultTemplate;
export const AssetTemplate = DefaultTemplate;
export const BedTemplate = DefaultTemplate;
