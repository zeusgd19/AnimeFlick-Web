"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth-context";
import { mergeSeenEpisodes } from "@/lib/utils/episode";

type Props = {
    slug: string;
};

export default function FetchWatchedEpisodes({ slug }: Props) {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        fetch(`/api/anime/${slug}/watched`)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched watched data:", data);
                const slugs =
                    data?.episodes?.map((x: any) => x?.episode_slug ?? x?.slug ?? x).filter(Boolean) || [];
                console.log("Extracted slugs:", slugs);
                mergeSeenEpisodes(slugs);
                // Trigger UI update
                window.dispatchEvent(new CustomEvent('watchedUpdated'));
            })
            .catch((err) => console.error("Error fetching watched episodes:", err));
    }, [slug, user]);

    return null; // No renderiza nada
}
