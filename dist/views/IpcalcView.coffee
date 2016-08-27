deps = [
    'umd-core/src/common'
    'application'
    'umd-core/src/views/ReactModelView'
    'umd-core/src/validation/validators'
    'umd-core/src/components/InputWithError'
    '../ipcalc'
    '../resources'
]

freact = ({Backbone, i18n}, app, ReactModelView, validators, InputWithError, ipcalc, resources)->
    btnAccentRaisedRipple = 'mdl-button mdl-js-button mdl-button--accent mdl-button--raised mdl-js-ripple-effect'
    app.updateResources resources

    addressValidator = (value, attr, computed)->
        if not value or ipcalc.argton(value) is false
            return validators.error 'ipcalc.error.INVALID_IPV4', field: attr

    maskValidator = (value, attr, computed)->
        if not value or ipcalc.argton(value, {isNetmask: true}) is false
            return validators.error 'ipcalc.error.INVALID_IPV4', field: attr

    class ParameterModel extends Backbone.Model
        validation:
            address: fn: addressValidator
            mask: fn: (value, attr, computed)->
                switch computed.type
                    when 'deaggregate'
                        return addressValidator value, attr, computed
                    else
                        return maskValidator value, attr, computed
            subnet: fn: (value, attr, computed)->
                switch computed.type
                    when 'split_network'
                        if 'string' isnt typeof value or not /^\s*\d+(?:\s*[\s,]\s*\d+)*\s*$/.test(value)
                            return validators.error 'ipcalc.error.INVALID_SPLIT', field: attr
                    when 'subnets'
                        return maskValidator value, attr, computed

    subnetsToString = (subnets, short = true)->
        '[\n' + subnets.map((element, index) ->
            '  ' + element.toString(short)
        ).join('\n') + '\n]'

    class IpcalcView extends ReactModelView
        initialize: ->
            @params = new ParameterModel @props.params
            return

        showNetwork: (evt)=>
            evt.preventDefault()
            @params.set 'type', 'network'
            invalidAttrs = @params.validate null, {forceUpdate: false}
            if not invalidAttrs
                attributes = @params.toJSON()
                network = ipcalc attributes.address, attributes.mask
                @inline.set 'content', network.toString()
            return

        deaggregate: (evt)=>
            evt.preventDefault()
            @params.set 'type', 'deaggregate'
            invalidAttrs = @params.validate null, {forceUpdate: false}
            if not invalidAttrs
                attributes = @params.toJSON()
                subnets = ipcalc.deaggregate attributes.address, attributes.mask
                content = subnetsToString subnets
                @inline.set 'content', content
            return

        split_network: (evt)=>
            evt.preventDefault()
            @params.set 'type', 'split_network'
            invalidAttrs = @params.validate null, {forceUpdate: false}
            if not invalidAttrs
                attributes = @params.toJSON()

                input = attributes.subnet.match /(\d+)/g
                subnets = input.map (value)-> parseInt(value, 10)
                try
                    subnets = ipcalc.split_network attributes.address, attributes.mask, subnets
                catch e
                    @inline.set 'content', e.message
                    return

                content = []
                content.push "needed_size: #{subnets.needed_size}"
                content.push "used: #{subnets.used.toString()}"
                content.push "unused: #{subnetsToString subnets.unused}"
                content.push "subnets:"
                content.push subnetsToString subnets, false
                @inline.set 'content', content.join('\n')
            return

        subnets: (evt)=>
            evt.preventDefault()
            @params.set 'type', 'subnets'
            invalidAttrs = @params.validate null, {forceUpdate: false}
            if not invalidAttrs
                attributes = @params.toJSON()
                try
                    subnets = ipcalc.subnets attributes.address, attributes.mask, attributes.subnet
                catch e
                    @inline.set 'content', e.message
                    return

                content = []
                content.push "hostn: #{subnets.hostn}"
                content.push subnetsToString subnets
                @inline.set 'content', content.join('\n')
            return

        render: ->
            params = @params
            `<form onSubmit={this.showNetwork} className="container">
                <h1>{i18n.t('home.home.ipcalc.title')}</h1>

                <div className="clearfix">
                    <InputWithError className="col-md-6" spModel={params.address} label={i18n.t('ipcalc.label.address')} deferred={true} />
                    <InputWithError className="col-md-6" spModel={params.mask} label={i18n.t('ipcalc.label.mask')} deferred={true} />
                </div>

                <button type="submit" className={btnAccentRaisedRipple}>
                    {i18n.t('ipcalc.button.show-network')}
                </button>

                &nbsp;&nbsp;

                <button type="button" className={btnAccentRaisedRipple} onClick={this.deaggregate}>
                    {i18n.t('ipcalc.button.deaggregate')}
                </button>

                <div className="clearfix">
                    <InputWithError className="col-md-6" spModel={params.subnet} label={i18n.t('ipcalc.label.subnet')} deferred={true} />
                </div>

                <button type="button" className={btnAccentRaisedRipple} onClick={this.split_network}>
                    {i18n.t('ipcalc.button.split')}
                </button>

                &nbsp;&nbsp;

                <button type="button" className={btnAccentRaisedRipple} onClick={this.subnets}>
                    {i18n.t('ipcalc.button.subnet')}
                </button>

                <br spRepeat={2} key={index} />

                <pre spModel="content">{this.inline.get('content')}</pre>

            </form>`
