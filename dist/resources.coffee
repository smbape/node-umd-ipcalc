module.exports = (options)->
    {prefix, suffix} = options?.interpolation or {prefix: "{{", suffix: "}}"}

    "en-GB": translation: ipcalc:
        title: 'Ip calculator'
        description: "Some operations on ipv4 network, like display subnet, deaggregate, split"
        label:
            address: 'Network address (Begin address for deaggregate)'
            mask: 'Network mask (End address for deaggregate)'
            subnet: 'Subnets of [n1, n2, ...] hosts (Subnets with this given mask)'
            wildcard: 'Negate netmask'
        button:
            'show-network': 'Show network'
            deaggregate: 'Deaggregate'
            split: 'Split using hosts'
            subnet: 'Split using mask'
        error:
            INVALID_IPV4: "Invalid IPV4 address #{prefix}address#{suffix}"
            INVALID_NETMASK: "Invalid netmask #{prefix}address#{suffix}"
            INVALID_NETWORK: "Invalid network address #{prefix}address#{suffix}"
            INVALID_SPLIT: "Invalid split values. Expecting 'n1, n2, ...'"

    "fr-FR": translation: ipcalc:
        title: "Calculateur d'ip"
        description: "Quelques opérations sur les ipv4 réseaux, telles que afficher le réseau, déagréger le réseau, diviser le réseau"
        label:
            address: 'Adresse réseau (Adresse de début à désagréger)'
            mask: 'Masque de sous-réseau (Adresse de fin à désagréger)'
            wildcard: 'Inverser le masque de sous-réseau'
            subnet: 'Sous-réseaux [n1, n2, ...] hôtes (Sous-réseaux avec ce masque)'
        button:
            'show-network': 'Afficher le réseau'
            deaggregate: 'Désagréger'
            split: "Diviser en sous-réseaux d'hôtes"
            subnet: "Diviser en sous-réseaux avec ce masque"
        error:
            INVALID_IPV4: "Adresse IPV4 invalide #{prefix}address#{suffix}"
            INVALID_NETMASK: "Masque de sous-réseau invalide #{prefix}address#{suffix}"
            INVALID_NETWORK: "Adresse réseau invalide #{prefix}address#{suffix}"
            INVALID_SPLIT: "Division invalide. Attendu: 'n1, n2, ...'"
