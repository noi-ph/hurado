"use client";
import { UserLookupDTO } from "common/types";
import BoxIcon from "client/components/box_icon";
import { getPath, Path } from "client/paths";

type UserViewerProps = {
  user: UserLookupDTO;
  canEdit: boolean;
};

export const UserViewer = ({ user, canEdit }: UserViewerProps) => {
  return (
    <>
      <p className="font-bold text-6xl mt-8 mb-2 text-blue-450">
        {user.username}
        {canEdit ? (
          <a href={getPath({ kind: Path.UserEdit, username: user.username })}>
            <BoxIcon
              name="bxs-edit"
              className="bx-md text-blue-400 hover:text-blue-450 ml-4 align-top"
            />
          </a>
        ) : (
          ""
        )}
      </p>
      <p className="font-sans font-bold text-xl text-gray-500 mt-4">
        {user.name ? user.name : "Anonymous User"} <br></br>
        {user.school ? user.school : "No Affiliation"}
      </p>
    </>
  );
};
