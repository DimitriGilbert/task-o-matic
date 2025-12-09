# Bash completion for task-o-matic
# Source this file or copy to /etc/bash_completion.d/

_task_o_matic() {
    local cur prev words cword
    _init_completion || return

    # Main commands
    local main_commands="tasks prd config init"

    # Task subcommands
    local task_commands="list create show update delete status get-next next tree enhance split plan get-plan list-plan delete-plan set-plan document get-documentation add-documentation execute execute-loop tag untag"

    # PRD subcommands
    local prd_commands="parse rework ask"

    # Config subcommands
    local config_commands="get set reset"

    # Init subcommands
    local init_commands="init bootstrap"

    # Handle main command completion
    if [[ $cword -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "$main_commands --help --version" -- "$cur") )
        return
    fi

    # Handle subcommand completion
    case "${words[1]}" in
        tasks)
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$task_commands --help" -- "$cur") )
            else
                # Complete options for specific task commands
                case "${words[2]}" in
                    list)
                        COMPREPLY=( $(compgen -W "-s --status -t --tag --help" -- "$cur") )
                        ;;
                    get-next|next)
                        COMPREPLY=( $(compgen -W "-s --status -t --tag -e --effort -p --priority --help" -- "$cur") )
                        ;;
                    status)
                        COMPREPLY=( $(compgen -W "-i --id -s --status --help" -- "$cur") )
                        ;;
                    add-documentation)
                        COMPREPLY=( $(compgen -W "-i --id -f --doc-file -o --overwrite --help" -- "$cur") )
                        ;;
                    *)
                        COMPREPLY=( $(compgen -W "--help" -- "$cur") )
                        ;;
                esac
            fi
            ;;
        prd)
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$prd_commands --help" -- "$cur") )
            else
                COMPREPLY=( $(compgen -W "--help" -- "$cur") )
            fi
            ;;
        config)
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$config_commands --help" -- "$cur") )
            else
                COMPREPLY=( $(compgen -W "--help" -- "$cur") )
            fi
            ;;
        init)
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$init_commands --help" -- "$cur") )
            else
                case "${words[2]}" in
                    init)
                        COMPREPLY=( $(compgen -W "--ai-provider --ai-model --ai-key --ai-provider-url --max-tokens --temperature --no-bootstrap --project-name --frontend --backend --database --auth --context7-api-key --directory --package-manager --runtime --payment --cli-deps --tui-framework --help" -- "$cur") )
                        ;;
                    bootstrap)
                        COMPREPLY=( $(compgen -W "--frontend --backend --database --orm --no-auth --addons --examples --no-git --package-manager --no-install --db-setup --runtime --api --payment --cli-deps --tui-framework --help" -- "$cur") )
                        ;;
                    *)
                        COMPREPLY=( $(compgen -W "--help" -- "$cur") )
                        ;;
                esac
            fi
            ;;
    esac
}

complete -F _task_o_matic task-o-matic
