<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">

    <title>
        {{ ucwords(str_replace('_', ' ', $report)) }} Report
    </title>

    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #222;
        }

        h1 {
            font-size: 18px;
            margin-bottom: 5px;
        }

        .generated {
            color: #666;
            margin-bottom: 20px;
        }

        .summary {
            width: 100%;
            margin-bottom: 20px;
        }

        .summary td {
            border: 1px solid #ddd;
            padding: 8px;
        }

        .summary-label {
            font-size: 9px;
            color: #666;
        }

        .summary-value {
            font-size: 14px;
            font-weight: bold;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th {
            background: #f1f1f1;
            font-weight: bold;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 5px;
            text-align: left;
        }

        tr {
            page-break-inside: avoid;
        }
    </style>
</head>

<body>

    <h1>
        {{ ucwords(str_replace('_', ' ', $report)) }} Report
    </h1>

    <div class="generated">
        Generated:
        {{ $generatedAt->format('Y-m-d H:i:s') }}
    </div>

    @if(!empty($summary))

        <table class="summary">
            <tr>
                @foreach($summary as $key => $value)

                    @if(!is_array($value))

                        <td>
                            <div class="summary-label">
                                {{ ucwords(str_replace('_', ' ', $key)) }}
                            </div>

                            <div class="summary-value">
                                @if(is_numeric($value))
                                    {{ number_format((float) $value, 2) }}
                                @else
                                    {{ $value }}
                                @endif
                            </div>
                        </td>

                        @if($loop->iteration % 4 === 0)
                            </tr>
                            <tr>
                        @endif

                    @endif

                @endforeach
            </tr>
        </table>

    @endif

    @if(!empty($rows))

        <table>
            <thead>
                <tr>
                    @foreach(array_keys($rows[0]) as $column)
                        <th>
                            {{ ucwords(str_replace('_', ' ', $column)) }}
                        </th>
                    @endforeach
                </tr>
            </thead>

            <tbody>

                @foreach($rows as $row)

                    <tr>
                        @foreach($row as $value)

                            <td>
                                @if(is_array($value))
                                    {{ json_encode($value) }}
                                @else
                                    {{ $value }}
                                @endif
                            </td>

                        @endforeach
                    </tr>

                @endforeach

            </tbody>
        </table>

    @else

        <p>No records found.</p>

    @endif

</body>
</html>