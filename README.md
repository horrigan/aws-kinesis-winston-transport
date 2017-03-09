# AWS Kinesis Winston Transport

A Winston transport for AWS Kinesis

## Configuration

    const winston = require("winston")
    require("./aws-kinesis-winston-transport.js")

    winston.configure({
        transports: [
            new (winston.transports.Kinesis)({
                kinesisStreamName: "kinesis-stream"
                label: "virginholidays"
            })
        ]
    })

The configuration options are:

- kinesisStreamName: the kinesis stream name
- stringify: see winston documentation
- showLevel: see winston documentation
- label: see winston documentation
- timestamp: see winston documentation