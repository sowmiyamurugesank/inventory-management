import "../styles/DataTable.css";

function DataTable(props) {
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        {props.columns.map((column) => (
                            <th key={column.key}>
                                {column.label}
                            </th>
                        ))}
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {props.data.length > 0 ? (
                        props.data.map((item, index) => (
                            <tr key={index}>
                                {props.columns.map((column) => (
                                    <td key={column.key}>
                                        {item[column.key]}
                                    </td>
                                ))}
                                <td>
                                    {props.actions(item)}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={props.columns.length + 1}>
                                No data available
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default DataTable;