// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { DetailedHTMLProps, HTMLAttributes, TableHTMLAttributes } from "react";
import classNames from "classnames";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { DefaultLayout } from "client/components/layouts/default_layout";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { getSession } from "server/sessions";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { ForbiddenPage } from "server/errors/forbidden";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { canManageContests } from "server/authorization";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { ContestSummaryDTO } from "common/types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- pre-existing error before eslint inclusion
import { db } from "db";

type TableProps = DetailedHTMLProps<HTMLAttributes<HTMLTableElement>, HTMLTableElement>;
type TableSectionProps = DetailedHTMLProps<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
type TableRowProps = DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
type TableCellProps = DetailedHTMLProps<HTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>;

export function AdminTable(props: TableProps) {
  return (
    <table
      {...props}
      className={classNames("table-auto w-full border-collapse", props.className)}
    />
  );
}

export function AdminThead(props: TableSectionProps) {
  return (
    <thead
      {...props}
      className={classNames("bg-gray-200", props.className)}
    />
  );
}

export function AdminTbody(props: TableSectionProps) {
  return (
    <tbody
      {...props}
      className={classNames("bg-white", props.className)}
    />
  );
}

export function AdminTR(props: TableRowProps) {
  return (
    <tr
      {...props}
      className={classNames("border-b border-gray-300", props.className)}
    />
  );
}

export function AdminTH(props: TableCellProps) {
  return (
    <th
      {...props}
      className={classNames("px-4 py-2 text-left font-medium text-gray-700", props.className)}
    />
  );
}

export function AdminTD(props: TableCellProps) {
  return (
    <td
      {...props}
      className={classNames("px-4 py-2 text-gray-600", props.className)}
    />
  );
}
