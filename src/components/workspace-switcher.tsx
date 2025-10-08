"use client";

import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspace";

export const WorkspaceSwitcher = () => {

    const {data} = useGetWorkspaces();
    return (
        <div>
            {data?.total}
        </div>
    )
}