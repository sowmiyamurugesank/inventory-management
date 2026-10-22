
import "../styles/DataTable.css";

function DataTable(props) {
  const totalRecords = props.data.length;

  return (
    <div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {props.columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {props.data.length > 0 ? (
              props.data.map((item, index) => (
                <tr key={item.id ?? index}>
                  {props.columns.map((column) => (
                    <td key={column.key}>{item[column.key] ?? "-"}</td>
                  ))}

                  <td>
                    <div className="action-buttons">
                      {props.actions(item)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={props.columns.length + 1}
                  className="empty-table"
                >
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <p>
          Showing {totalRecords === 0 ? 0 : 1} -{" "}
          {Math.min(totalRecords, 15)} of {totalRecords} records
        </p>
      </div>
    </div>
  );
}

export default DataTable;
