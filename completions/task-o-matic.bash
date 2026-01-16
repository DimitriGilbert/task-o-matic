# Bash completion for task-o-matic
# Source this file or copy to /etc/bash_completion.d/
# Auto-generated - DO NOT EDIT MANUALLY

_task_o_matic() {
    local cur prev words cword
    _init_completion || return

    # Main commands (dynamically extracted)
    local main_commands="config
tasks
prd
continue
prompt
init
workflow
benchmark
install
detect"

    # Handle main command completion
    if [[ $cword -eq 1 ]]; then
        COMPREPLY=( $(compgen -W "$main_commands --help --version" -- "$cur") )
        return
    fi

    # Handle subcommand completion for each main command
    case "${words[1]}" in
        config)
            local subcommands="get-ai-config
set-ai-provider
info
help"
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$subcommands --help" -- "$cur") )
            else
                # Complete options for specific subcommands
                case "${words[2]}" in
                    get-ai-config)
                        COMPREPLY=( $(compgen -W "--help -ai-config -h -o-matic --help" -- "$cur") )
                        ;;
                    set-ai-provider)
                        COMPREPLY=( $(compgen -W "--help -ai-provider -h -o-matic --help" -- "$cur") )
                        ;;
                    info)
                        COMPREPLY=( $(compgen -W "--help -h -o-matic --help" -- "$cur") )
                        ;;
                    help)
                        COMPREPLY=( $(compgen -W "--help -ai-config -ai-provider -h -o-matic --help" -- "$cur") )
                        ;;
                    *)
                        COMPREPLY=( $(compgen -W "--help" -- "$cur") )
                        ;;
                esac
            fi
            ;;
        tasks)
            local subcommands="list
create
show
update
delete
status
add-tags
remove-tags
plan
get-plan
list-plan
delete-plan
set-plan
enhance
split
document
get-documentation
add-documentation
execute
execute-loop
subtasks
tree
get-next
help"
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$subcommands --help" -- "$cur") )
            else
                # Complete options for specific subcommands
                case "${words[2]}" in
                    list)
                        COMPREPLY=( $(compgen -W "--help --status --tag -h -o-matic -progress -s -t --help" -- "$cur") )
                        ;;
                    create)
                        COMPREPLY=( $(compgen -W "--ai-enhance --ai-key --ai-model --ai-provider --ai-provider-url --content --effort --help --parent-id --reasoning --stream --title -h -o-matic --help" -- "$cur") )
                        ;;
                    show)
                        COMPREPLY=( $(compgen -W "--help --id -h -o-matic --help" -- "$cur") )
                        ;;
                    update)
                        COMPREPLY=( $(compgen -W "--description --effort --help --id --status --tags --title -h -o-matic -progress -separated --help" -- "$cur") )
                        ;;
                    delete)
                        COMPREPLY=( $(compgen -W "--cascade --force --help --id -h -o-matic --help" -- "$cur") )
                        ;;
                    status)
                        COMPREPLY=( $(compgen -W "--help --id --status -h -i -o-matic -progress -s --help" -- "$cur") )
                        ;;
                    add-tags)
                        COMPREPLY=( $(compgen -W "--help --id --tags -h -o-matic -separated -tags --help" -- "$cur") )
                        ;;
                    remove-tags)
                        COMPREPLY=( $(compgen -W "--help --id --tags -h -o-matic -separated -tags --help" -- "$cur") )
                        ;;
                    plan)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --help --id --reasoning --stream -h -o-matic --help" -- "$cur") )
                        ;;
                    get-plan)
                        COMPREPLY=( $(compgen -W "--help --id -h -o-matic -plan --help" -- "$cur") )
                        ;;
                    list-plan)
                        COMPREPLY=( $(compgen -W "--help -h -o-matic -plan --help" -- "$cur") )
                        ;;
                    delete-plan)
                        COMPREPLY=( $(compgen -W "--help --id -h -o-matic -plan --help" -- "$cur") )
                        ;;
                    set-plan)
                        COMPREPLY=( $(compgen -W "--help --id --plan --plan-file -h -line -o-matic -plan --help" -- "$cur") )
                        ;;
                    enhance)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --all --dry --force --help --reasoning --status --stream --tag --task-id -h -o-matic -progress --help" -- "$cur") )
                        ;;
                    split)
                        COMPREPLY=( $(compgen -W "--ai --ai-key --ai-provider --ai-provider-url --all --combine-ai --dry --force --help --reasoning --status --stream --tag --task-id --tools -h -o-matic -progress --help" -- "$cur") )
                        ;;
                    document)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --force --help --reasoning --stream --task-id -h -o-matic --help" -- "$cur") )
                        ;;
                    get-documentation)
                        COMPREPLY=( $(compgen -W "--help --id -documentation -h -o-matic --help" -- "$cur") )
                        ;;
                    add-documentation)
                        COMPREPLY=( $(compgen -W "--doc-file --help --id --overwrite -documentation -f -h -i -o -o-matic --help" -- "$cur") )
                        ;;
                    execute)
                        COMPREPLY=( $(compgen -W "--auto-commit --continue-session --dry --help --id --include-prd --max-retries --message --model --plan --plan-model --plan-tool --review --review-model --review-plan --tool --try-models --validate --verify -h -in -m -mini -o-matic --help" -- "$cur") )
                        ;;
                    execute-loop)
                        COMPREPLY=( $(compgen -W "--auto-commit --continue-session --dry --help --ids --include-completed --include-prd --max-retries --message --model --notify --plan --plan-model --plan-tool --review --review-model --review-plan --status --tag --tool --try-models --validate --verify -completed -h -loop -m -mini -o-matic -progress -separated --help" -- "$cur") )
                        ;;
                    subtasks)
                        COMPREPLY=( $(compgen -W "--help --id -h -o-matic --help" -- "$cur") )
                        ;;
                    tree)
                        COMPREPLY=( $(compgen -W "--help --id -h -o-matic --help" -- "$cur") )
                        ;;
                    get-next)
                        COMPREPLY=( $(compgen -W "--effort --help --priority --status --tag -e -h -next -o-matic -p -progress -s -t --help" -- "$cur") )
                        ;;
                    help)
                        COMPREPLY=( $(compgen -W "--help -documentation -h -loop -next -o-matic -plan -tags --help" -- "$cur") )
                        ;;
                    *)
                        COMPREPLY=( $(compgen -W "--help" -- "$cur") )
                        ;;
                esac
            fi
            ;;
        prd)
            local subcommands="create
combine
parse
rework
question
refine
get-stack
generate
help"
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$subcommands --help" -- "$cur") )
            else
                # Complete options for specific subcommands
                case "${words[2]}" in
                    create)
                        COMPREPLY=( $(compgen -W "--ai --ai-reasoning --combine-ai --help --output-dir --stream -h -o-matic --help" -- "$cur") )
                        ;;
                    combine)
                        COMPREPLY=( $(compgen -W "--ai --ai-reasoning --description --files --help --output --stream -h -master -o-matic --help" -- "$cur") )
                        ;;
                    parse)
                        COMPREPLY=( $(compgen -W "--ai --ai-key --ai-model --ai-provider --ai-provider-url --ai-reasoning --combine-ai --file --help --message --prompt --stream --tools -h -o-matic --help" -- "$cur") )
                        ;;
                    rework)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --ai-reasoning --feedback --file --help --message --output --prompt --stream --tools -h -o-matic --help" -- "$cur") )
                        ;;
                    question)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --ai-reasoning --file --help --message --output --prompt --stream --tools -h -o-matic -questions --help" -- "$cur") )
                        ;;
                    refine)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --ai-reasoning --file --help --message --output --prompt --questions --stream --tools -h -o-matic --help" -- "$cur") )
                        ;;
                    get-stack)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --ai-reasoning --content --file --help --json --message --output --project-name --prompt --save --stream --tools -h -o-matic -stack --help" -- "$cur") )
                        ;;
                    generate)
                        COMPREPLY=( $(compgen -W "--ai --ai-reasoning --from-codebase --help --json --output --stream --tools -engineering -h -o-matic -state --help" -- "$cur") )
                        ;;
                    help)
                        COMPREPLY=( $(compgen -W "--help -engineering -h -o-matic -stack --help" -- "$cur") )
                        ;;
                    *)
                        COMPREPLY=( $(compgen -W "--help" -- "$cur") )
                        ;;
                esac
            fi
            ;;
        continue)
            COMPREPLY=( $(compgen -W "--add-feature --generate-plan --generate-tasks --help --status --update-prd -a -g -h -o-matic -p -s -u --help" -- "$cur") )
            ;;
        prompt)
            COMPREPLY=( $(compgen -W "--context-info --executor --full-context --help --list --metadata --prd-content --prd-file --stack-info --task-description --task-file --task-title --type --user-feedback --var -breakdown -detection -enhancement -h -l -m -o-matic -parsing -prd -related -rework -t --help" -- "$cur") )
            ;;
        init)
            local subcommands="init
bootstrap
attach"
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$subcommands --help" -- "$cur") )
            else
                # Complete options for specific subcommands
                case "${words[2]}" in
                    init)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --auth --backend --cli-deps --context --database --directory --frontend --help --max-tokens --no-bootstrap --package-manager --payment --project-name --runtime --temperature -ai -api-key -auth -bare -h -o-matic -separated --help" -- "$cur") )
                        ;;
                    bootstrap)
                        COMPREPLY=( $(compgen -W "--addons --api --auth --backend --cli-deps --database --db-setup --examples --frontend --help --no-auth --no-git --no-install --orm --package-manager --payment --runtime --template -atlas -auth -bare -h -o-matic -postgres -separated --help" -- "$cur") )
                        ;;
                    attach)
                        COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --analyze --context --create-prd --dry-run --help --max-tokens --redetect --temperature -ai -api-key -detection -generate -h -o-matic --help" -- "$cur") )
                        ;;
                    *)
                        COMPREPLY=( $(compgen -W "--help" -- "$cur") )
                        ;;
                esac
            fi
            ;;
        workflow)
            COMPREPLY=( $(compgen -W "--ai-key --ai-model --ai-provider --ai-provider-url --auth --auto-accept --backend --bootstrap --config-file --database --execute --execute-concurrency --execute-max-retries --execute-model --execute-plan --execute-plan-model --execute-review --execute-review-model --execute-tool --frontend --generate-instructions --generate-method --help --include-docs --init-method --no-auth --no-auto-commit --no-bootstrap --no-include-docs --prd-answer-ai-model --prd-answer-ai-provider --prd-answer-ai-reasoning --prd-answer-mode --prd-combine --prd-combine-model --prd-content --prd-description --prd-file --prd-method --prd-multi-generation --prd-multi-generation-models --prd-question-refine --project-description --project-name --refine-feedback --refine-method --skip-all --skip-bootstrap --skip-generate --skip-init --skip-prd --skip-prd-combine --skip-prd-multi-generation --skip-prd-question-refine --skip-refine --skip-split --skip-stack-suggestion --split-all --split-instructions --split-method --split-tasks --stream --suggest-stack-from-prd --try-models --use-existing-config --validate --verify -accept -assisted -based -commit -generation -h -mini -o-matic -separated --help" -- "$cur") )
            ;;
        benchmark)
            local subcommands="run
list
operations
show
compare
execution
execute-loop
workflow
help"
            if [[ $cword -eq 2 ]]; then
                COMPREPLY=( $(compgen -W "$subcommands --help" -- "$cur") )
            else
                # Complete options for specific subcommands
                case "${words[2]}" in
                    run)
                        COMPREPLY=( $(compgen -W "--answers --concurrency --content --delay --description --effort --feedback --file --filename --force --help --message --models --output-dir --parent-id --prds --prompt --question-mode --task-id --title --tools -breakdown -combine -create -document -h -o-matic -parse -refine -rework -separated --help" -- "$cur") )
                        ;;
                    list)
                        COMPREPLY=( $(compgen -W "--help -h -o-matic --help" -- "$cur") )
                        ;;
                    operations)
                        COMPREPLY=( $(compgen -W "--help -h -o-matic --help" -- "$cur") )
                        ;;
                    show)
                        COMPREPLY=( $(compgen -W "--help -h -o-matic --help" -- "$cur") )
                        ;;
                    compare)
                        COMPREPLY=( $(compgen -W "--help -h -o-matic --help" -- "$cur") )
                        ;;
                    execution)
                        COMPREPLY=( $(compgen -W "--help --max-retries --models --no-keep-branches --task-id --verify -h -o-matic -separated --help" -- "$cur") )
                        ;;
                    execute-loop)
                        COMPREPLY=( $(compgen -W "--help --ids --max-retries --models --no-keep-branches --status --tag --try-models --verify -h -loop -o-matic -progress -separated --help" -- "$cur") )
                        ;;
                    workflow)
                        COMPREPLY=( $(compgen -W "--auth --backend --concurrency --delay --execute --frontend --generate-instructions --help --init-method --models --prd-description --prd-file --prd-method --project-description --project-name --skip-all --skip-generate --skip-refine --skip-split --split-instructions --temp-dir -assisted -h -o-matic -separated --help" -- "$cur") )
                        ;;
                    help)
                        COMPREPLY=( $(compgen -W "--help -h -loop -o-matic --help" -- "$cur") )
                        ;;
                    *)
                        COMPREPLY=( $(compgen -W "--help" -- "$cur") )
                        ;;
                esac
            fi
            ;;
        install)
            COMPREPLY=( $(compgen -W "--force --help -h -o-matic --help" -- "$cur") )
            ;;
        detect)
            COMPREPLY=( $(compgen -W "--help --json --save -h -o-matic --help" -- "$cur") )
            ;;
    esac
}

complete -F _task_o_matic task-o-matic
