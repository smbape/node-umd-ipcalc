factory = (require)->
    (options)->
        {prefix, suffix} = options?.interpolation or {prefix: "{{", suffix: "}}"}

        "en-GB": translation: ipcalc:
            label:
                address: 'Network address (Begin address for deaggregate)'
                mask: 'Network mask (End address for deaggregate)'
                subnet: 'Subnets of [n1, n2, ...] hosts (Subnets with this given mask)'
                wildcard: 'Negate netmask'
            button:
                'show-network': 'Show network'
                deaggregate: 'Deaggregate'
                split: 'Split into subnets of hosts'
                subnet: 'Split into subnets with mask'
            error:
                INVALID_IPV4: "Invalid IPV4 address #{prefix}arg#{suffix}"
                INVALID_NETMASK: "Invalid netmask #{prefix}arg#{suffix}"
                INVALID_SPLIT: "Invalid split values. Expecting 'n1, n2, ...'"

        "fr-FR": translation: ipcalc:
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
                INVALID_IPV4: "Adresse IPV4 invalide #{prefix}arg#{suffix}"
                INVALID_NETMASK: "Masque de sous-réseau invalide #{prefix}arg#{suffix}"
                INVALID_SPLIT: "Division invalide. Attendu: 'n1, n2, ...'"
