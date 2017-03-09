const os = require("os")
const util = require("util")
const aws = require("aws-sdk")
const common = require("winston/lib/winston/common")
const winston = require("winston")

const kinesis = new aws.Kinesis()

const KinesisTransport = function (config) {
    winston.Transport.call(this)
    this.config = config || {}
}
util.inherits(KinesisTransport, winston.Transport)
KinesisTransport.prototype.name = "Kinesis"
KinesisTransport.prototype.log = function (level, msg, meta, callback) {
    const output = common.log({
        colorize: false,
        json: true,
        level: level,
        message: msg,
        meta: meta,
        stringify: this.config.stringify || ((value) => {
            value["@timestamp"] = value.timestamp
            delete value.timestamp
            return JSON.stringify(value)
        }),
        showLevel: this.config.showLevel || true,
        label: this.config.label || "kinesis",
        timestamp: this.config.timestamp || true
    })
    const self = this;
    (function retry(tries) {
        const params = {
            Data: output, PartitionKey: `${Math.random()}`,
            StreamName: self.config.kinesisStreamName
        }
        kinesis.putRecord(params, ((error, data) => {
            if (error) {
                process.stderr.write(error + os.EOL)
                if (tries > 0) {
                    process.stderr.write("Error logging, retrying..." + os.EOL)
                    setTimeout(() => retry(--tries), 1000)
                } else {
                    process.stderr.write("Error! No more attempts to log" + os.EOL)
                }
            } else {
                process.stdout.write(JSON.stringify(data) + os.EOL)
                callback(error, error == null)
                self.emit("logged")
            }
        }))
    })(5)
}

winston.transports.Kinesis = KinesisTransport
