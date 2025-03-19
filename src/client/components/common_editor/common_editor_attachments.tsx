import classNames from "classnames";
import { ReactNode, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { Arrays } from "common/utils/arrays";
import { InputChangeEvent } from "common/types/events";
import { normalizeAttachmentPath } from "common/utils/attachments";
import { UnreachableError } from "common/errors";
import BoxIcon from "client/components/box_icon";
import {
  CommonAttachmentED,
  CommonAttachmentLocal,
  CommonAttachmentSaved,
  CommonFileLocal,
  EditorKind,
} from "./types";
import {
  CommonEditorAddButton,
  CommonEditorTableCell,
  CommonEditorTableHeader,
} from "./common_editor_parts";
import { destructivelyComputeSHA1 } from "./common_editor_utils";
import styles from "./common_editor.module.css";

type CommonAttachmentSavedProps = {
  index: number;
  attachment: CommonAttachmentSaved;
  attachments: CommonAttachmentED[];
  setAttachments(attachments: CommonAttachmentED[]): void;
  getAttachmentURL(attachment: CommonAttachmentSaved): string;
};

const CommonAttachmentSavedX = ({
  index,
  attachment,
  attachments,
  setAttachments,
  getAttachmentURL,
}: CommonAttachmentSavedProps) => {
  const onClickDelete = useCallback(() => {
    setAttachments(
      Arrays.replaceNth(attachments, index, {
        ...attachment,
        deleted: !attachment.deleted,
      })
    );
  }, [index, attachment, attachments, setAttachments]);

  const filename = attachment.path.split("/").pop();
  return (
    <>
      <CommonEditorTableCell deleted={attachment.deleted}>{filename}</CommonEditorTableCell>
      <CommonEditorTableCell deleted={attachment.deleted}>{attachment.path}</CommonEditorTableCell>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(getAttachmentURL(attachment));
            toast("Filepath copied to clipboard!", { type: "success" });
          }}
        >
          <BoxIcon name="bxs-copy" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
        <a target="_blank" href={getAttachmentURL(attachment)}>
          <BoxIcon name="bx-download" className="bx-sm text-blue-300 hover:text-blue-500" />
        </a>
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type CommonAttachmentLocalProps = {
  index: number;
  attachment: CommonAttachmentLocal;
  attachments: CommonAttachmentED[];
  setAttachments(attachments: CommonAttachmentED[]): void;
};

const CommonAttachmentLocalX = ({
  index,
  attachment,
  attachments,
  setAttachments,
}: CommonAttachmentLocalProps) => {
  const onChangePath = useCallback(
    (event: InputChangeEvent) => {
      setAttachments(
        Arrays.replaceNth(attachments, index, {
          ...attachment,
          path: event.target.value,
        })
      );
    },
    [index, attachment, attachments, setAttachments]
  );

  const onBlurPath = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
    (_event: InputChangeEvent) => {
      setAttachments(
        Arrays.replaceNth(attachments, index, {
          ...attachment,
          path: normalizeAttachmentPath(attachment.path),
        })
      );
    },
    [index, attachment, attachments, setAttachments]
  );

  const onClickDelete = useCallback(() => {
    setAttachments([...attachments.slice(0, index), ...attachments.slice(index + 1)]);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [index, attachment, setAttachments]);

  return (
    <>
      <CommonEditorTableCell deleted={false}>{attachment.filename}</CommonEditorTableCell>
      <CommonEditorTableCell deleted={false}>
        <input
          type="text"
          value={attachment.path}
          onBlur={onBlurPath}
          onChange={onChangePath}
          className="w-full"
        />
      </CommonEditorTableCell>
      <div className="flex flex-row justify-end items-center px-3 gap-2">
        <button type="button" onClick={onClickDelete}>
          <BoxIcon name="bx-x" className="bx-sm text-blue-300 hover:text-blue-500" />
        </button>
      </div>
    </>
  );
};

type CommonEditorAttachmentsProps = {
  attachments: CommonAttachmentED[];
  setAttachments(attachments: CommonAttachmentED[]): void;
  getAttachmentURL(attachment: CommonAttachmentED): string;
  hint: React.ReactNode;
};

export function CommonEditorAttachments({
  attachments,
  setAttachments,
  getAttachmentURL,
  hint,
}: CommonEditorAttachmentsProps): ReactNode {
  const pickerRef = useRef<HTMLInputElement>(null);
  const onFileSelect = useCallback(() => {
    if (pickerRef.current?.files == null) {
      return;
    }
    const newAttachments: CommonAttachmentLocal[] = [];
    for (const file of pickerRef.current.files) {
      const newFile: CommonFileLocal = {
        kind: EditorKind.Local,
        file,
        hash: "",
      };
      destructivelyComputeSHA1(newFile);
      const newAttachment: CommonAttachmentLocal = {
        kind: EditorKind.Local,
        file: newFile,
        path: file.name,
        filename: file.name,
        mime_type: file.type,
        deleted: false,
      };

      newAttachments.push(newAttachment);
    }

    setAttachments([...attachments, ...newAttachments]);
  }, [attachments, setAttachments]);

  const onFileSelectStart = useCallback(() => {
    if (pickerRef.current?.files == null) {
      return;
    }
    pickerRef.current.click();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pre-existing error before eslint inclusion
  }, [attachments, setAttachments]);

  return (
    <div>
      <div
        className={classNames(styles.attachments, "border border-gray-300 rounded-lg text-center")}
      >
        <CommonEditorTableHeader text="File Name" />
        <CommonEditorTableHeader text="Path" />
        <div /> {/* Actions header placeholder */}
        {attachments.map((attachment, idx) => {
          switch (attachment.kind) {
            case EditorKind.Saved:
              return (
                <CommonAttachmentSavedX
                  key={idx}
                  attachment={attachment}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  getAttachmentURL={getAttachmentURL}
                  index={idx}
                />
              );
            case EditorKind.Local:
              return (
                <CommonAttachmentLocalX
                  key={idx}
                  attachment={attachment}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  index={idx}
                />
              );
            default:
              throw new UnreachableError(attachment);
          }
        })}
      </div>
      <div className="text-xs text-gray-500 mt-1">{hint}</div>
      <div className="flex justify-center mt-2">
        <CommonEditorAddButton onClick={onFileSelectStart} label="Add New" />
        <input
          type="file"
          className="hidden"
          ref={pickerRef}
          onChange={onFileSelect}
          multiple={true}
        />
      </div>
    </div>
  );
}
